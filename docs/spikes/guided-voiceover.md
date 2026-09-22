# Guided voice-over production note

## Decision

Guided voice-over is an optional, repository-backed enhancement to StoryNode narration. The browser never calls a speech service. Authoring uses a reproducible Gradio generation script; the resulting MP3 files, duration metadata, hashes, and provenance are committed with the lore data.

Voice-over applies only to the continuous guided-history narration. Dossiers, interface labels, provenance panels, battle playback, and free exploration remain text-only.

## Performance direction

The voice is an original low male chronicler: mature, resonant, restrained, landscape-conscious, and unhurried. The desired weight and spacious cadence are broad tonal references; no Warcraft recording, character voice, or performer sample is used or imitated.

The original production set used Kokoro's `am_onyx` voice at speed `0.5` followed by another `0.9` tempo pass. Listening review rejected that result as unnaturally slow and difficult to understand.

The replacement production set uses Kokoro's stock British male `bm_lewis` voice at native speed `0.9`, selected from a fourteen-candidate audition spanning four model families. It receives loudness normalization only; no secondary tempo manipulation, reverb, pitch shift, voice cloning, or performer reference is used. The intended result is measured and authoritative without sacrificing natural cadence or intelligibility.

## Asset contract

- One MP3 per StoryNode under `public/audio/guided/<guide-id>/<node-id>.mp3`.
- Story data owns `assetPath`, measured duration, voice ID, and AI-generation disclosure.
- `public/audio/guided/manifest.json` records hashes, byte sizes, durations, and generator settings.
- `public/audio/guided/provenance.json` records model, license, voice, speed, disclosure, and the absence of reference audio.
- `pnpm generate:voiceovers` regenerates or resumes the corpus through `hexgrad/Kokoro-TTS`; `--force` replaces existing files and `--gpu` opts into the public accelerated queue.
- `pnpm validate:data` fails when a declared voice-over asset is absent.

## Playback contract

- Voice-over is off by default and begins only after a visitor enables it.
- The visible StoryNode narration remains the accessible transcript.
- Turning voice-over off pauses and resets the current clip; turning it on again starts that chapter from the beginning.
- Previous, Next, guide exit, era changes, and chapter changes interrupt the old clip before the replacement begins.
- With voice-over enabled, the audio `ended` event advances the guide. With it disabled, the existing text-duration timer advances the guide.
- The preference persists independently of story progress, so a visitor can turn narration off and back on throughout the tour.

## Validation performed

- 117 StoryNodes, 117 MP3 files, zero missing assets.
- The Lewis replacement corpus is approximately 50.4 minutes and 34.7 MiB, with measured duration and hashes recorded in `public/audio/guided/manifest.json`.
- Browser playback reached `readyState 4`, advanced `currentTime`, stopped on disable, restarted on re-enable, and loaded the next chapter's distinct MP3.
- A focused Playwright regression covers on, off, on again, and next-chapter playback.

## Prior-art lesson

The Ocarina of Trump repository established useful production discipline: deterministic filenames, authored manifests, provenance, normalization, duration awareness, and explicit interruption testing. Azeroth Chronicle adopts those general safeguards while keeping its implementation web-native, opt-in, and independent of any ROM audio system.
