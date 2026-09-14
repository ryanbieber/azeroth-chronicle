# Azeroth Chronicle

Azeroth Chronicle is a desktop-first, time-aware 3D historical atlas for Warcraft lore. It is designed around eras, changing spatial states, structured battles, causal relationships, guided stories, and source provenance.

> **Unofficial fan project:** Azeroth Chronicle is a fan-made interpretation of the Warcraft universe and is not affiliated with, endorsed by, sponsored by, or approved by Blizzard Entertainment.

This repository implements the [product and technical specification](./docs/azeroth_3d_lore_atlas_product_technical_spec_UPDATED.docx). Cosmic Origins and Era 1 contain source-linked `research` content; the later navigable eras remain research scaffolds. None of it should be treated as human-reviewed Warcraft canon yet.

## What works now

- Vite, React, and TypeScript application shell
- React Three Fiber atlas with orbit, pan, zoom, generated terrain, relational cosmography, uncertainty-aware regions, and sourced site markers
- Ten available eras in the top navigation, beginning with a complete Cosmic Origins research prologue
- Separate Zustand stores for era, layers, selection, story, and source filters
- TypeScript domain contracts and Zod schemas
- File-backed repository adapter with cross-record validation
- Data-driven StoryNode action interpreter
- Source-linked Cosmic Origins and Black Empire research slices plus empty research map states for the remaining eras
- Unit tests, linting, type checks, CI, and Render static-site configuration

The full delivery sequence and architectural decisions are in [`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md). The research, terrain, people, battle, and animated-tour program—including the implemented Cosmic Origins prologue—is in [`docs/eras/README.md`](./docs/eras/README.md).

Live GitHub Pages build: <https://ryanbieber.github.io/azeroth-chronicle/>

## Local development

Requirements: Node.js 24 or newer and pnpm 11.

```bash
pnpm install
pnpm dev
```

Open the URL printed by Vite. Useful routes include:

- `/map?era=black-empire`
- `/map?era=black-empire&selected=battle:elemental-assault-on-black-empire`
- `/eras/black-empire`
- `/battles/elemental-assault-on-black-empire`

Keep `pnpm dev` running during implementation. Vite hot-reloads the open browser tab as source, styles, and data change, so routine iteration does not require restarting or reopening the application.

## Quality commands

```bash
pnpm validate:data
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check
```

## Content rules

1. Research notes do not go directly into publishable summaries.
2. Every significant factual claim needs a source and citation.
3. Approximate, inferred, speculative, and unknown material must be labeled.
4. Do not copy source prose or scans into the public application.
5. Promote research records to reviewed or published status only after human lore review.

The editorial timeline uses *World of Warcraft: Chronicle* Volumes 1–4 as its backbone. In-world eras and boundaries are derived from the reviewed chronology in those volumes; a book volume is a source grouping, not automatically an in-world era.

## Repository map

```text
src/app/state/             Independent UI and playback stores
src/components/            Map, dossier, story, and layout modules
src/domain/types/          Stable domain contracts
src/domain/schemas/        Runtime validation contracts
src/domain/repositories/   Storage-neutral read interfaces
src/lib/                   Lore, map, search, and story engine logic
src/pages/                 Permanent route views
data/                      Versioned lore and GeoJSON source records
public/                    Runtime-loaded textures, models, and icons
scripts/                   Build-time validation and asset tooling
tests/                     Unit and future integration/e2e tests
docs/                      Architecture and delivery plan
```

## Deployment

The repository deploys GitHub Pages from `.github/workflows/deploy-pages.yml`. That build supplies the repository base path and emits a `404.html` SPA fallback so direct dossier and map links work. `render.yaml` remains available for a Render Static Site deployment at the domain root. No backend, database, authentication, or secret-bearing client integration is required for the MVP.

## Project status

The reusable engine, ten-era navigation, source-linked **Cosmic Origins**, and **Primordial Azeroth and the Black Empire** previews are implemented. The deployed site is an unofficial public research preview, not a lore-reviewed publication: both complete slices remain explicitly marked as research until their claims, citations, summaries, and interpretive visuals pass human review. See the current-status and content-gated sections of the implementation plan.
