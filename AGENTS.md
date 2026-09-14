# Azeroth Chronicle Repository Guidance

These instructions apply to every file in this repository. Future agents must read this file and `docs/IMPLEMENTATION_PLAN.md` before making architectural, data-model, lore-content, or deployment changes.

## Product north star

Azeroth Chronicle is a time-aware lore database and causal history engine whose primary interface is a 3D historical atlas. It is not merely a map with lore annotations. Every significant feature should help a user answer:

- What was the world like in this era?
- Who controlled this place?
- What happened here, why did it happen, and what did it change?
- What happened next?
- Which source supports the claim?

The Black Empire is the first vertical slice, not a special case in the engine.

## Authority and scope

1. The product and technical specification at the repository root defines product intent.
2. `docs/IMPLEMENTATION_PLAN.md` defines the current architecture and delivery sequence.
3. Existing tests and schemas define executable contracts.
4. If these sources disagree, document the conflict before changing behavior. Prefer the product specification for user outcomes and the implementation plan for current technical decisions.

## Non-negotiable architecture rules

- Keep the MVP a Vite, React, and strict TypeScript static application.
- Do not add an API, database, authentication, server runtime, or secret-bearing browser integration without a documented requirement and decision record.
- Keep lore access behind `LoreRepository`. UI components must not read file paths directly.
- Keep domain types independent of React, Three.js, Zustand, and storage implementations.
- Keep era, selection, layers, story, source filters, and map view as separate state domains. Do not create a giant global store.
- Keep per-frame camera and pointer state out of React stores.
- Drive StoryNodes and battle phases through validated data and a reusable action interpreter. Do not add era-specific conditionals to reusable engine code.
- Treat time-varying location and geometry as SpatialState or MapState data. Never assume one entity has one permanent position.
- Use worldspace-local atlas coordinates; never present fictional map coordinates as Earth latitude/longitude.
- Permanent text-first dossier routes must remain usable without the 3D canvas.
- Major world changes use separate map states until measured requirements justify morphing.

## Lore and provenance rules

- Never invent Warcraft lore, names, dates, locations, participants, outcomes, causal links, or certainty.
- New unverified records must use unmistakable placeholder names and `contentStatus: placeholder` or `research`.
- Only human-reviewed records may become `reviewed` or `published`.
- Significant published claims require Source, Citation, and Claim records.
- Label inference, ambiguity, disputes, retcons, approximate geography, and unknown geography explicitly.
- Do not place an unknown location as an exact map marker.
- Public summaries must be original paraphrases. Do not ship source scans or bulk copied prose.
- Keep research notes and publishable content separate.
- The application must identify itself as an unofficial fan project.
- Guided-tour narration should use an original mythic, Tolkien-esque chronicle voice: warm, elevated, landscape-conscious, and attentive to age, loss, consequence, and wonder. Never copy or closely imitate Tolkien's sentences, signature phrases, characters, or invented languages; source-backed Warcraft facts and explicit uncertainty remain the backbone of every passage.

## Data and file conventions

- Use stable lowercase kebab-case IDs and slugs.
- Prefer one authored record per file while the dataset remains review-sized.
- Store source vectors as GeoJSON under `data/geometry`; derived optimized assets belong to the build output or public asset tree.
- Put large terrain, model, and texture assets under worldspace/map-state paths and load them by URL.
- Every data collection must be parsed with Zod before use.
- Every cross-record ID must be checked by build-time validation.
- Placeholder fixture filenames end in `.placeholder.json` or `.placeholder.geojson`.
- Generated indexes and derived assets must be reproducible from source files.

## UI and accessibility rules

- Preserve the historical-atlas, dark archival visual direction without copying Warcraft game UI or published page designs.
- Effects must explain history, not decorate it.
- Every key figure or embodied group introduced by a guided era must have a deliberate visual representation. It may appear only during the relevant story beat and need not remain on the map, but a generic marker alone is not sufficient for a key actor. Realms, forces, places, and concepts may instead be represented by terrain or environmental art when that treatment communicates them clearly. Keep representations source-aware, original, accessible through accompanying text, and explicit when their composition is interpretive rather than geographic.
- Do not rely on color alone for confidence, geographic certainty, importance, or selection.
- Every animation needs reduced-motion and skip-to-final-state behavior.
- Keyboard users must be able to reach controls, stories, and dossiers.
- Provide loading, empty, error, and WebGL-unavailable states.
- Keep URLs shareable and restore meaningful era and selection context.

## Performance rules

- Measure before introducing complex optimization, but design the hot path correctly from the start.
- Do not update React state on every camera frame.
- Lazy-load worldspace and map-state assets.
- Batch or instance repeated map objects when realistic measurements justify it.
- Keep large 3D assets out of the main JavaScript bundle.
- Record performance test profiles and results in `docs/spikes`.

## Required workflow

Before implementation:

1. Identify whether the change is reusable engine work or era content work.
2. Identify the relevant implementation-plan phase and acceptance criterion.
3. For architectural divergence, add or update a decision record before coding.

Before committing:

```bash
pnpm check
pnpm build
```

Add focused tests for changed schemas, selectors, coordinate transforms, story actions, route state, and user-visible behavior. Do not weaken tests or validation to make a change pass.

## Explicit MVP non-goals

- Full Warcraft world coverage
- Tactical battle simulation
- Multiplayer or collaborative editing
- User-generated canon edits
- Mobile feature parity
- Cinematic character models
- Automatic AI lore generation
- Procedural terrain perfection
- Globe projection
- Complex continent morphing

## Change discipline

- Keep changes small enough to review and map them to acceptance criteria.
- Preserve user changes and unrelated work in a dirty worktree.
- Document new dependencies and justify large runtime libraries.
- Prefer a small, inspectable solution over speculative infrastructure.
- Update the implementation plan when a completed spike changes an architectural decision.
- Use calm, precise, tech-priest-flavored commit and pull-request language, but keep code and technical documentation clear and professional.
