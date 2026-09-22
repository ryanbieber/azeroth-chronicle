import { Client } from '@gradio/client';
import ffmpegPath from 'ffmpeg-static';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import process from 'node:process';

const SPACE_ID = 'hexgrad/Kokoro-TTS';
const FUNCTION_INDEX = 4;
const DEFAULT_VOICE = 'am_onyx';
const DEFAULT_SPEED = 0.5;
const POST_TEMPO = 0.9;
const OUTPUT_ROOT = resolve('public/audio/guided');
const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, value = 'true'] = arg.replace(/^--/, '').split('=', 2);
  return [key, value];
}));
const force = args.has('force');
const useGpu = args.has('gpu');
const limit = args.has('limit') ? Number(args.get('limit')) : Number.POSITIVE_INFINITY;
const voice = args.get('voice') ?? DEFAULT_VOICE;
const speed = Number(args.get('speed') ?? DEFAULT_SPEED);
const voiceId = `kokoro-${voice.replaceAll('_', '-')}`;

if (!ffmpegPath) throw new Error('ffmpeg-static did not provide a platform binary. Run pnpm install with approved build scripts.');
if (!Number.isFinite(speed) || speed < 0.5 || speed > 2) throw new Error(`Invalid speed: ${speed}`);
if ((limit !== Number.POSITIVE_INFINITY && !Number.isFinite(limit)) || limit < 1) throw new Error(`Invalid limit: ${limit}`);

function wavDurationMs(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('Gradio returned an invalid WAV file.');
  }
  let byteRate;
  let dataSize;
  for (let offset = 12; offset + 8 <= buffer.length;) {
    const id = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (id === 'fmt ') byteRate = buffer.readUInt32LE(offset + 16);
    if (id === 'data') {
      dataSize = size;
      break;
    }
    offset += 8 + size + (size % 2);
  }
  if (!byteRate || dataSize === undefined) throw new Error('WAV metadata is incomplete.');
  return Math.round((dataSize / byteRate) * 1000);
}

function runFfmpeg(inputPath, outputPath) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(ffmpegPath, [
      '-hide_banner', '-loglevel', 'error', '-y',
      '-i', inputPath,
      '-map_metadata', '-1',
      '-ac', '1',
      '-ar', '24000',
      '-filter:a', `atempo=${POST_TEMPO}`,
      '-codec:a', 'libmp3lame',
      '-b:a', '64k',
      outputPath,
    ], { stdio: ['ignore', 'inherit', 'inherit'] });
    child.once('error', reject);
    child.once('exit', (code) => code === 0
      ? resolvePromise()
      : reject(new Error(`ffmpeg exited with code ${code}`)));
  });
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeStoryVoiceover(path, nodeId, voiceover) {
  const source = await readFile(path, 'utf8');
  const compactMarker = `"id":"${nodeId}"`;
  const compactKey = source.includes(compactMarker);
  const nodeStart = source.indexOf(compactKey ? compactMarker : `"id": "${nodeId}"`);
  if (nodeStart < 0) throw new Error(`Could not locate ${nodeId} in ${path}`);
  const firstLineEnd = source.indexOf('\n', nodeStart);
  const durationStart = source.indexOf('"durationMs"', nodeStart);
  const singleLineFormat = firstLineEnd < 0 || (durationStart >= 0 && durationStart < firstLineEnd);
  const nextNode = source.indexOf(singleLineFormat ? '\n' : '\n    {', nodeStart + nodeId.length);
  const nodeEnd = nextNode < 0 ? source.length : nextNode;
  const nodeSource = source.slice(nodeStart, nodeEnd);
  if (singleLineFormat) {
    const compactBlock = `"voiceover":${JSON.stringify(voiceover)},`;
    const existingCompact = /"voiceover":\{[^}]+\},/;
    const duration = /"durationMs":\d+,/;
    let updatedNode;
    if (existingCompact.test(nodeSource)) {
      updatedNode = nodeSource.replace(existingCompact, compactBlock);
    } else if (duration.test(nodeSource)) {
      updatedNode = nodeSource.replace(duration, (field) => `${field}${compactBlock}`);
    } else {
      throw new Error(`Could not update voiceover for ${nodeId}`);
    }
    await writeFile(path, `${source.slice(0, nodeStart)}${updatedNode}${source.slice(nodeEnd)}`);
    return;
  }
  const block = `      "voiceover":${JSON.stringify(voiceover)},`;
  const existing = / {6}"voiceover":(?:\{[^\n]*\}|\{\n(?: {8}.*\n)+? {6}\}),/;
  let updatedNode;
  if (existing.test(nodeSource)) {
    updatedNode = nodeSource.replace(existing, block);
  } else {
    const duration = / {6}"durationMs": ?\d+,/;
    if (!duration.test(nodeSource)) throw new Error(`Could not locate durationMs for ${nodeId}`);
    updatedNode = nodeSource.replace(duration, (line) => `${line}\n${block}`);
  }
  await writeFile(path, `${source.slice(0, nodeStart)}${updatedNode}${source.slice(nodeEnd)}`);
}

const storyFiles = (await readdir(resolve('data/stories')))
  .filter((name) => name.endsWith('.json'))
  .sort();
const stories = await Promise.all(storyFiles.map(async (filename) => ({
  filename,
  path: resolve('data/stories', filename),
  value: JSON.parse(await readFile(resolve('data/stories', filename), 'utf8')),
})));
const work = stories.flatMap((story) => story.value.nodes.map((node) => ({ story, node }))).slice(0, limit);
const client = await Client.connect(SPACE_ID);
const tracks = [];

for (const [index, { story, node }] of work.entries()) {
  const relativePath = `audio/guided/${story.value.guide.id}/${node.id}.mp3`;
  const outputPath = resolve('public', relativePath);
  const tempPath = `${outputPath}.wav`;
  let durationMs = node.voiceover?.durationMs;

  try {
    if (force || !(await stat(outputPath).catch(() => undefined))) {
      process.stdout.write(`[${index + 1}/${work.length}] Generating ${node.id}...\n`);
      const result = await client.predict(FUNCTION_INDEX, [node.narration, voice, speed, useGpu]);
      const audio = result.data?.[0];
      if (!audio?.url) throw new Error(`No audio URL returned for ${node.id}`);
      const response = await globalThis.fetch(audio.url);
      if (!response.ok) throw new Error(`Audio download failed (${response.status}) for ${node.id}`);
      const wav = Buffer.from(await response.arrayBuffer());
      durationMs = Math.round(wavDurationMs(wav) / POST_TEMPO);
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(tempPath, wav);
      await runFfmpeg(tempPath, outputPath);
    } else {
      process.stdout.write(`[${index + 1}/${work.length}] Reusing ${node.id}.\n`);
    }

    const bytes = await readFile(outputPath);
    node.voiceover = {
      assetPath: relativePath,
      durationMs,
      voiceId,
      aiGenerated: true,
    };
    tracks.push({
      nodeId: node.id,
      guideId: story.value.guide.id,
      assetPath: relativePath,
      durationMs,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      bytes: bytes.length,
    });
    await writeStoryVoiceover(story.path, node.id, node.voiceover);
  } finally {
    await rm(tempPath, { force: true });
  }
}

const generatedAt = new Date().toISOString();
await writeJson(resolve(OUTPUT_ROOT, 'manifest.json'), {
  schemaVersion: 1,
  generatedAt,
  generator: { spaceId: SPACE_ID, functionIndex: FUNCTION_INDEX, voice, voiceId, speed, postTempo: POST_TEMPO, hardware: useGpu ? 'zerogpu' : 'cpu' },
  trackCount: tracks.length,
  totalDurationMs: tracks.reduce((sum, track) => sum + (track.durationMs ?? 0), 0),
  tracks,
});
await writeJson(resolve(OUTPUT_ROOT, 'provenance.json'), {
  schemaVersion: 1,
  generatedAt,
  disclosure: 'AI-generated narration using a stock synthetic voice; not a human performance or a Warcraft performer.',
  scope: 'Guided-tour StoryNode narration only.',
  model: 'hexgrad/Kokoro-82M',
  modelLicense: 'Apache-2.0',
  modelSha256: '496dba118d1a58f5f3db2efc88dbdc216e0483fc89fe6e47ee1f2c53f18ad1e4',
  gradioSpace: SPACE_ID,
  voice,
  voiceId,
  speed,
  postTempo: POST_TEMPO,
  referenceAudioUsed: false,
  direction: 'Original low male chronicler; restrained, ancient, deliberate, and unhurried. Tonal reference only; no imitation of a Warcraft character or performer.',
});
process.stdout.write(`Generated ${tracks.length} repository-backed guided voice-over tracks.\n`);
