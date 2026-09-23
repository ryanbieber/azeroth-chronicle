# Atlas legibility and tour flow audit

2026-09-23. Reusable Phase 4 story controls and Phase 6 map label hardening; no era content or lore records changed.

## Observed problem

At 1440 × 900, the Third War guide projected character and group art onto neighboring points. Arthas and Jaina, and the Scourge and Kel'Thuzad, could occupy the same visible area. The mobile tour card could also push its playback controls below the map viewport. A direct full-tour link briefly displayed a node from another era while URL state initialized.

## Changes

- Reduce default projected character and subject widths, preserving the original art and click targets.
- Resolve visible figure and label rectangles in screen space about twelve times per second. Keep them within the map and away from the tour card, selected dossier, and opened cartographer note. The original geometry and map anchors remain unchanged.
- Show explicit Pause/Resume, Previous, Next, and voice-over controls. Pausing stops silent-tour timing and holds the current audio position; resuming continues both from that point. A restored chapter waits for the visitor to resume.
- Keep phone playback controls visible by scrolling the transcript within the compact tour card.
- Give the navigation and story surfaces a coherent blue-black, aged-gold, and parchment palette inspired by Warcraft's atmosphere, using original shapes and styling.

## Verification

- A browser sweep visited all 117 guided chapters at 1440 × 900. After camera transitions settled, no projected name labels overlapped.
- Third War chapter-by-chapter legibility is now a focused browser regression test.
- The complete ten-era tour reached its completion screen.
- `pnpm check` passed: 57 unit/integration tests and 1,063 validated lore records.
- `pnpm build` passed. The existing large-chunk warning remains.
- CI-style browser run against the production build: 24 passed, 2 Linux-only visual snapshots skipped on Windows. This included voice toggle, audio pause/resume, silent-tour pause/resume, desktop/tablet/phone navigation, and mobile control visibility.

The screen-space offsets are presentation only; they do not claim exact new locations for people or events. A very narrow viewport may still show less map while the transcript is open, but playback controls remain reachable and the text can scroll.
