import { Client } from '@gradio/client';
import ffmpegPath from 'ffmpeg-static';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import process from 'node:process';

const PASSAGE = "Before any world carried mountain, sea, or name, Chronicle begins with a boundless opposition. Light shone without measure, and beyond its reach gathered Shadow—the Void. They were not kingdoms upon a chart, but primordial powers, divided in nature and bound within the first telling of the cosmos.";
const OUTPUT_ROOT = resolve('public/audio/auditions/cosmic-origins-opening');
const force = process.argv.includes('--force');

if (!ffmpegPath) throw new Error('ffmpeg-static did not provide a binary.');

const candidates = [
  {
    id: 'qwen-designed-ancient-scholar',
    provider: 'Qwen3-TTS VoiceDesign',
    space: 'Qwen/Qwen3-TTS',
    apiName: '/generate_voice_design',
    inputs: [PASSAGE, 'English', 'An original adult male baritone with a resonant chest voice, calm intelligence, and restrained authority. Speak slowly but naturally, with precise diction, quiet wonder, and deliberate pauses at sentence boundaries. Clean studio recording. Avoid growling, whispering, theatrical villainy, and exaggerated fantasy accents.'],
    direction: 'Resonant ancient scholar; deliberate, lucid, quietly awed.',
  },
  {
    id: 'qwen-designed-sentinel',
    provider: 'Qwen3-TTS VoiceDesign',
    space: 'Qwen/Qwen3-TTS',
    apiName: '/generate_voice_design',
    inputs: [PASSAGE, 'English', 'An original mature male voice, low and powerful but humane, like a patient guardian recounting the oldest history. Measured conversational cadence, warm resonance, thoughtful emphasis, crisp consonants, and natural pauses. No rasp, no whisper, no shouting, no imitation of an existing character or actor.'],
    direction: 'Mature sentinel; weighty, humane, protective.',
  },
  {
    id: 'qwen-aiden-measured',
    provider: 'Qwen3-TTS CustomVoice',
    space: 'Qwen/Qwen3-TTS',
    apiName: '/generate_custom_voice',
    inputs: [PASSAGE, 'English', 'Aiden', 'Speak as a composed historical guide: unhurried, intelligent, resonant, and quietly powerful. Use natural pauses and restrained wonder.', '1.7B'],
    direction: 'Stock Aiden voice; composed historical guide.',
  },
  {
    id: 'qwen-uncle-fu-elder',
    provider: 'Qwen3-TTS CustomVoice',
    space: 'Qwen/Qwen3-TTS',
    apiName: '/generate_custom_voice',
    inputs: [PASSAGE, 'English', 'Uncle_fu', 'Speak in clear natural English as an elder chronicler: low, patient, grave without gloom, and never rushed. Keep the delivery intimate and intelligent.', '1.7B'],
    direction: 'Stock Uncle Fu voice; elder chronicler.',
  },
  {
    id: 'qwen-preset-aiden',
    provider: 'Qwen3-TTS Preset',
    space: 'Qwen/Qwen3-TTS-Demo',
    apiName: '/tts_interface',
    inputs: [PASSAGE, 'Aiden / 艾登', 'English / 英文'],
    direction: 'Aiden preset; direct English narration baseline.',
  },
  {
    id: 'qwen-preset-eldric-sage',
    provider: 'Qwen3-TTS Preset',
    space: 'Qwen/Qwen3-TTS-Demo',
    apiName: '/tts_interface',
    inputs: [PASSAGE, 'Eldric Sage / 精品百人-沧明子', 'English / 英文'],
    direction: 'Eldric Sage preset; elder male narration baseline.',
  },
  {
    id: 'parler-resonant-chronicler',
    provider: 'Parler-TTS',
    space: 'parler-tts/parler_tts',
    apiName: '/gen_tts',
    inputs: [PASSAGE, "A mature man's deep baritone voice delivers the passage at a measured, natural pace. His tone is intelligent, grounded, warm, and quietly powerful, with crisp diction and thoughtful pauses. The recording is close, clean, and free of background noise. He does not whisper, growl, or sound theatrical.", true],
    direction: 'Deep baritone chronicler; grounded and clean.',
  },
  {
    id: 'parler-distinguished-scholar',
    provider: 'Parler-TTS',
    space: 'parler-tts/parler_tts',
    apiName: '/gen_tts',
    inputs: [PASSAGE, "A distinguished older man's resonant voice speaks with educated precision and restrained authority. His delivery is unhurried but not sluggish, with subtle wonder and natural sentence pauses. The voice is full, clear, and calm in a high-quality studio recording, without rasp or melodrama.", true],
    direction: 'Distinguished older scholar; precise and restrained.',
  },
  {
    id: 'kokoro-george-natural',
    provider: 'Kokoro-82M',
    space: 'hexgrad/Kokoro-TTS',
    apiName: 4,
    inputs: [PASSAGE, 'bm_george', 0.88, false],
    direction: 'George British male preset at natural measured speed.',
  },
  {
    id: 'kokoro-lewis-natural',
    provider: 'Kokoro-82M',
    space: 'hexgrad/Kokoro-TTS',
    apiName: 4,
    inputs: [PASSAGE, 'bm_lewis', 0.9, false],
    direction: 'Lewis British male preset at natural measured speed.',
  },
  {
    id: 'kokoro-adam-natural',
    provider: 'Kokoro-82M',
    space: 'hexgrad/Kokoro-TTS',
    apiName: 4,
    inputs: [PASSAGE, 'am_adam', 0.88, false],
    direction: 'Adam American male preset at natural measured speed.',
  },
  {
    id: 'kokoro-michael-natural',
    provider: 'Kokoro-82M',
    space: 'hexgrad/Kokoro-TTS',
    apiName: 4,
    inputs: [PASSAGE, 'am_michael', 0.88, false],
    direction: 'Michael American male preset at natural measured speed.',
  },
  {
    id: 'kokoro-fenrir-natural',
    provider: 'Kokoro-82M',
    space: 'hexgrad/Kokoro-TTS',
    apiName: 4,
    inputs: [PASSAGE, 'am_fenrir', 0.9, false],
    direction: 'Fenrir American male preset at natural measured speed.',
  },
  {
    id: 'kokoro-fable-natural',
    provider: 'Kokoro-82M',
    space: 'hexgrad/Kokoro-TTS',
    apiName: 4,
    inputs: [PASSAGE, 'bm_fable', 0.9, false],
    direction: 'Fable British male preset at natural measured speed.',
  },
  {
    id: 'kokoro-puck-natural',
    provider: 'Kokoro-82M',
    space: 'hexgrad/Kokoro-TTS',
    apiName: 4,
    inputs: [PASSAGE, 'am_puck', 0.92, false],
    direction: 'Puck American male preset at natural measured speed.',
  },
  {
    id: 'kokoro-daniel-natural',
    provider: 'Kokoro-82M',
    space: 'hexgrad/Kokoro-TTS',
    apiName: 4,
    inputs: [PASSAGE, 'bm_daniel', 0.92, false],
    direction: 'Daniel British male preset at natural measured speed.',
  },
  {
    id: 'orpheus-leo',
    provider: 'Orpheus-TTS',
    space: 'MohamedRashad/Orpheus-TTS',
    apiName: '/generate_speech',
    inputs: [PASSAGE, 'leo', 0.55, 0.9, 1.15, 1200],
    direction: 'Leo male preset; lower-variance narrative read.',
  },
  {
    id: 'orpheus-dan',
    provider: 'Orpheus-TTS',
    space: 'MohamedRashad/Orpheus-TTS',
    apiName: '/generate_speech',
    inputs: [PASSAGE, 'dan', 0.5, 0.9, 1.15, 1200],
    direction: 'Dan male preset; controlled narrative read.',
  },
  {
    id: 'styletts2-male-2',
    provider: 'StyleTTS2',
    space: 'Pendrokar/style-tts-2',
    apiName: '/synthesize',
    inputs: [PASSAGE, 'm-us-2', 'en-us', 8],
    direction: 'Male preset 2; diffusion-based baseline.',
  },
  {
    id: 'styletts2-male-4',
    provider: 'StyleTTS2',
    space: 'Pendrokar/style-tts-2',
    apiName: '/synthesize',
    inputs: [PASSAGE, 'm-us-4', 'en-us', 8],
    direction: 'Male preset 4; diffusion-based baseline.',
  },
];

function transcode(inputPath, outputPath) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(ffmpegPath, [
      '-hide_banner', '-loglevel', 'error', '-y',
      '-i', inputPath,
      '-map_metadata', '-1',
      '-ac', '1',
      '-ar', '24000',
      '-filter:a', 'loudnorm=I=-16:TP=-1.5:LRA=11',
      '-codec:a', 'libmp3lame',
      '-b:a', '96k',
      outputPath,
    ], { stdio: ['ignore', 'inherit', 'inherit'] });
    child.once('error', reject);
    child.once('exit', (code) => code === 0
      ? resolvePromise()
      : reject(new Error(`ffmpeg exited with code ${code}`)));
  });
}

async function downloadOutput(output, destination) {
  const url = typeof output === 'string' ? output : output?.url;
  if (!url) throw new Error(`No downloadable audio URL in ${JSON.stringify(output)}`);
  const response = await globalThis.fetch(url);
  if (!response.ok) throw new Error(`Audio download failed: ${response.status} ${response.statusText}`);
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

await mkdir(OUTPUT_ROOT, { recursive: true });
const clients = new Map();
const results = [];

for (const [index, candidate] of candidates.entries()) {
  const outputPath = resolve(OUTPUT_ROOT, `${candidate.id}.mp3`);
  const tempPath = resolve(OUTPUT_ROOT, `${candidate.id}.source`);
  process.stdout.write(`[${index + 1}/${candidates.length}] ${candidate.id}\n`);
  try {
    if (force || !(await stat(outputPath).catch(() => undefined))) {
      let client = clients.get(candidate.space);
      if (!client) {
        client = await Client.connect(candidate.space);
        clients.set(candidate.space, client);
      }
      const prediction = await client.predict(candidate.apiName, candidate.inputs);
      await downloadOutput(prediction.data?.[0], tempPath);
      await transcode(tempPath, outputPath);
    }
    const bytes = await readFile(outputPath);
    results.push({
      ...candidate,
      inputs: undefined,
      file: `${candidate.id}.mp3`,
      bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      status: 'generated',
    });
  } catch (error) {
    process.stderr.write(`  Failed: ${error instanceof Error ? error.message : String(error)}\n`);
    results.push({
      ...candidate,
      inputs: undefined,
      file: null,
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    await rm(tempPath, { force: true });
  }
}

await writeFile(resolve(OUTPUT_ROOT, 'manifest.json'), `${JSON.stringify({
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  productionUse: false,
  passage: PASSAGE,
  referenceAudioUsed: false,
  disclosure: 'AI-generated voice auditions using stock or text-designed synthetic voices. No Warcraft performer or character voice was cloned.',
  candidates: results,
}, null, 2)}\n`);

const generated = results.filter((result) => result.status === 'generated').length;
process.stdout.write(`Generated ${generated}/${results.length} voice auditions in ${OUTPUT_ROOT}.\n`);
