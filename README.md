# Azeroth Chronicle

Azeroth Chronicle is a desktop-first, time-aware 3D historical atlas for Warcraft lore. It is designed around eras, changing spatial states, structured battles, causal relationships, guided stories, and source provenance.

This repository is the implementation skeleton for the product and technical specification in [`azeroth_3d_lore_atlas_product_technical_spec_UPDATED.docx`](./azeroth_3d_lore_atlas_product_technical_spec_UPDATED.docx). The executable fixture data is intentionally fictional and marked `placeholder`; it must not be treated as Warcraft canon.

## What works now

- Vite, React, and TypeScript application shell
- React Three Fiber placeholder atlas with orbit, pan, zoom, a region, a route, and a battle marker
- Shareable era and battle routes, including map query state
- Separate Zustand stores for era, layers, selection, story, and source filters
- TypeScript domain contracts and Zod schemas
- File-backed repository adapter with cross-record validation
- Data-driven StoryNode action interpreter
- Placeholder Black Empire vertical slice data that makes no lore claims
- Unit tests, linting, type checks, CI, and Render static-site configuration

The full delivery sequence and architectural decisions are in [`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md).

## Local development

Requirements: Node.js 24 or newer and pnpm 11.

```bash
pnpm install
pnpm dev
```

Open the URL printed by Vite. Useful routes include:

- `/map?era=black-empire`
- `/map?era=black-empire&battle=atlas-conflict-placeholder`
- `/eras/black-empire`
- `/battles/atlas-conflict-placeholder`

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
5. Replace placeholder records only after human lore review.

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

`render.yaml` defines a Render Static Site build and an SPA fallback so direct dossier and map links resolve to `index.html`. Connect the GitHub repository in Render or create a Blueprint from the file. No backend, database, authentication, or secret-bearing client integration is required for the MVP.

## Project status

This is an architecture skeleton, not a canon-ready lore release. The next task is the Phase 0 renderer and coordinate-system spike described in the implementation plan.
