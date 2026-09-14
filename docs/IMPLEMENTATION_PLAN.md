# Azeroth Chronicle Implementation Plan

## Outcome

Build the Black Empire vertical slice as a static, client-heavy historical atlas that proves four ideas together: a navigable 3D map, structured and source-aware lore records, data-driven guided history, and explicit causes and consequences. The MVP should be deployable from GitHub to Render without a server, database, authentication, or private credentials.

The reusable engine must not contain Black Empire-specific behavior. Black Empire records live in the data layer and exercise generic era, map-state, battle, story, source, and relationship systems.

## Current implementation status — 2026-09-14

The repository contains a complete reusable technical vertical slice and the first source-linked era baseline:

- Phase 0's parsed GeoJSON, external GLB terrain, coordinate adapter, camera rig, URL restoration, performance profile, and deep-link proof are implemented.
- Reusable Phase 1–5 systems are implemented: generated manifests and search, typed reference validation, source filtering, permanent dossiers, multi-record map layers, battle playback, guided-story persistence/branch return, causality, and provenance.
- Phase 6 foundations are implemented: route splitting, responsive states, error/WebGL fallbacks, accessibility affordances, privacy and asset-origin decisions, Render/GitHub Pages deployment configuration, and visual regression coverage.
- The root route is a cinematic, reduced-motion-safe landing page. Its full-history action starts at the earliest completed guide and advances through later completed guided eras from data order, returning an explicit current-coverage message at the edge of the archive.
- Chronicle Volumes 1–4 are registered as the editorial source backbone, with research templates, vocabulary, confidence rules, and a citation review checklist.
- Ten eras are present in the top-level selector with separate research map states. Era 0, **Cosmic Origins**, now has a source-linked public research preview built around a non-geographic relational cosmography, four events, ten indexed subjects, claim provenance, and a continuous nine-node guided history. Their detailed, one-by-one research and production backlog lives in `docs/eras/README.md`.
- Era 1, **Primordial Azeroth and the Black Empire**, now has a source-linked public research preview: original generated terrain, inferred/approximate GeoJSON, 13 people/powers/places, four events, two conflict dossiers, a causal chain, a continuous unnumbered ten-node guided history, and clickable illustrated character overviews. Detailed battle phases remain in battle dossiers rather than interrupting the guided chronicle. Human citation and lore review still gates promotion to reviewed or published content.
- The scene contract now distinguishes terrain cartography from relational cosmography. Relational spatial states are validated as non-geographic and must explain their editorial composition; the reusable renderer contains no Cosmic Origins era-ID branch.

The reusable engine acceptance path and the Era 0–1 research-preview implementations are complete. This authorizes explicitly labeled public previews, not promotion of the records to `published`: both eras still require human review of their claim-level Chronicle citations, original summaries, interpretive visuals, stories, and causal chains. Later eras remain research scaffolds, and production-scale label density remains a future measurement gate.

## Architectural decisions

### Application and routing

- Use Vite, React, and strict TypeScript as a single-page application.
- Use `/` as the public landing page and primary full-history tour entry; retain `/map` as the shareable atlas workspace.
- Use React Router with permanent routes for `/eras/:slug`, `/battles/:slug`, `/events/:slug`, `/locations/:slug`, and `/factions/:slug`.
- Use `/map` query parameters for restorable explorer state: `era`, selected record, and optionally a compact camera bookmark. Public layer visibility is curated by era and story state rather than exposed as visitor configuration.
- Keep the 3D explorer client-rendered. Generate static dossier HTML only after measuring an actual search-indexing or link-preview need. If needed, add a build-time prerender step rather than a server runtime.
- Configure the static host to rewrite unknown routes to `/index.html` so browser refreshes work.

### State boundaries

- Keep durable content outside Zustand. The repository adapter owns content reads.
- Use small stores for `era`, `selection`, internal `layers`, `story`, provenance scope, and `mapView`. Layer and source-filter boundaries support the engine and editorial tooling; they are not public explorer controls.
- Treat the URL as shareable state and synchronize it at route boundaries, not every animation frame.
- Keep high-frequency camera and pointer state inside Three.js controls/refs. React stores receive only meaningful settled state.
- Persist story guide ID and node ID in session storage after the story behavior stabilizes. Do not persist transient timer or animation progress.

### Scene graph

```text
MapViewport3D
├─ CameraRig
├─ WorldspaceScene
│  ├─ Terrain
│  ├─ Ocean
│  ├─ RegionLayer
│  ├─ BorderLayer
│  ├─ RouteLayer
│  ├─ MarkerLayer
│  └─ LabelLayer
├─ StoryEffects
└─ InteractionController
```

- One scene represents the active worldspace and map state.
- Layer renderers consume normalized selectors rather than raw files.
- Batch repeated marker geometry and materials; use instancing when measurements justify it.
- Story effects are temporary overlays keyed by action IDs, separate from durable geography.
- Dispose loaded textures, geometries, and materials when switching heavy worldspace assets.

### Coordinate convention

- Author vectors in a worldspace-local `0..10000` two-dimensional atlas coordinate system.
- Record the authoring origin on each worldspace. The initial convention is bottom-left.
- Convert atlas X/Y to centered Three.js X/Z coordinates through one tested function.
- Reserve Three.js Y for elevation and overlay offsets.
- Never label these values as latitude or longitude.
- Store source-space geometry unchanged; optimization scripts produce derived runtime assets.

### GeoJSON and terrain

- Author points, routes, borders, and regions as GeoJSON.
- Validate bounds and feature IDs at build time.
- Convert polygons to triangulated `BufferGeometry`, lines to shared/batched line geometry, and points to instanced markers in a build step once real geometry is available.
- Begin with a low-poly GLB terrain mesh plus compressed KTX2 textures. Use Draco or Meshopt only after profiling decode and transfer costs.
- Keep terrain assets under `public/models/<worldspace>/<map-state>/` so they load by URL and never enter the main JavaScript chunk.
- Use separate map-state assets for major geographic changes. Defer continent morphing.

### Labels

- Use Drei HTML labels for the spike because they are accessible and fast to iterate.
- Before MVP lock, compare HTML labels with signed-distance-field text under realistic label counts.
- Retain HTML for selected/interactive labels and dossiers even if dense ambient labels move to SDF rendering.
- Apply deterministic priority, collision, distance, and layer rules. Never render every label unconditionally.

### Camera control

- Use OrbitControls for free exploration with bounded distance and polar angles.
- Add a `CameraRig` that interpolates position and target for scripted story instructions.
- Story camera commands can be skipped and must land at the same deterministic final pose.
- User input cancels the current interpolation without corrupting StoryNode progress.
- Reduced-motion mode applies the final pose immediately.

### Story engine

- A StoryGuide owns an ordered graph of StoryNodes; nodes contain narration, optional branches, a camera instruction, and VisualActions.
- A pure interpreter maps each VisualAction to explicit ports such as `setLayer`, `selectBattle`, `showRoute`, and `focusLocation`.
- Unsupported action types fail validation during development and fail visibly but safely at runtime.
- Entering a node applies actions idempotently from a known scene state.
- The public tour card is an unnumbered continuous sequence containing only Previous and Next controls plus a visible bottom-edge chapter timer; narration and timed map changes carry the story without archive-control clutter or embedded conflict sub-stories.
- Reusable branch-return state remains available to future tours, but the Black Empire tour keeps optional dossiers separate from the guided sequence. Clicking a map figure outside the tour opens a concise reader-facing overview; research and provenance detail remains on permanent routes.
- Tests cover every action type, node transitions, skip behavior, and branch-and-return state.
- Node narration remains the accessible transcript and future voice-over script. Optional audio may enhance a node later, but must never replace the text or its skip/reduced-motion behavior.

### Battle playback

- Represent battle playback as ordered phases with duration, narration, camera instruction, and route/region/marker actions.
- Build it on the same interpreter and animation scheduler used by StoryNodes.
- Playback is historical cartography, not unit simulation.
- Controls are play, pause, previous phase, next phase, restart, and skip to result.
- The final state is deterministic and can be shown immediately for reduced-motion users.

### Causal graph

- Model relationships as source-aware edges, with `fromId`, `toId`, relationship type, citation IDs, and confidence.
- Build adjacency lists at load time and use custom breadth-first traversal for immediate causes/consequences.
- Render the MVP graph with React Flow only if interaction requirements exceed a compact custom SVG. Start with custom SVG to minimize weight and retain styling control.
- Detect unintended causal cycles in validation while allowing explicitly flagged non-causal relationship cycles.

### Provenance

- A Source identifies a work; a Citation identifies a location inside that work; a Claim identifies an assertion with confidence and status.
- Published, active, non-speculative claims require at least one citation.
- Inferred map placement requires a visible geographic-certainty label and an editor note.
- Conflicting claims remain separate records; do not overwrite one claim with another.
- Public summaries are paraphrases. Research notes and copied excerpts remain outside public build inputs.

### Search

- Generate a compact JSON index during the build from validated publishable records.
- Start with normalized tokens and weighted fields: name, alias, type, era, tags, and short description.
- Use a small client-side library only if measured search quality requires fuzzy ranking.
- Search results link to permanent dossiers and include an atlas action that restores era and selection.

### Testing

- Vitest: schemas, date helpers, coordinates, graph traversal, source filtering, and story interpreter.
- Testing Library: curated layer visibility, dossier accessibility, guide progression, URL synchronization, and error states.
- Playwright in Phase 4: load Black Empire, open a concise marker overview, complete the unnumbered guide without embedded battle playback, verify permanent battle playback separately, and inspect provenance on permanent routes.
- Visual regression in Phase 6 for the application shell and key dossier states; avoid pixel-locking the animated canvas.
- Build validation fails on broken references, duplicate IDs/slugs, invalid bounds, missing required citations, and unintended causal cycles.

### Assets and caching

- Code-split by top-level route and lazy-load worldspace/map-state scene modules.
- Load heavy GLB/KTX2/GeoJSON assets by URL with immutable content hashes once the pipeline exists.
- Cache decoded assets in the browser session; do not keep all worldspaces resident.
- Set the initial CDN threshold after measurement. A starting decision gate is any single asset over 10 MB compressed or total static assets over 100 MB.
- Move heavy assets to object storage/CDN when repository size, clone time, or host bandwidth becomes painful; preserve URLs behind an asset manifest.

### Deployment and future backend

- Deploy the MVP as a Render Static Site from GitHub. GitHub Pages remains a prototype fallback.
- Do not introduce Supabase/Postgres, authentication, or an API until a concrete feature requires server state.
- Backend triggers include user accounts, bookmarks synchronized across devices, browser-based editing, contributions, private credentials, collaborative review, or spatial queries too large for the client.
- A future `PostgresLoreRepository` must implement the same read interface as `StaticLoreRepository`. UI and scene selectors must not depend on file paths.
- PostGIS stores source geometry; the build/cache layer can still serve optimized client assets.

### Content authoring workflow

The initial editorial timeline is grounded in *World of Warcraft: Chronicle* Volumes 1–4. Treat each volume as a source scope, not as an in-world era by itself: era records and boundaries must be derived from the chronology after human citation review. Where the volumes conflict or revise an account, preserve separate claims and label the dispute or supersession.

```text
source material
→ human research notes
→ candidate JSON or YAML records
→ schema and reference validation
→ human lore and citation review
→ reviewed repository data
→ generated indexes and map assets
→ application
```

- Keep one record per file while content is small and review-driven.
- Use stable kebab-case IDs that do not encode display names likely to change.
- Add `contentStatus` and exclude non-published records from production when real content entry begins.
- QGIS is the vector-authoring tool; Blender is reserved for terrain and exceptional 3D assets.

## Delivery phases

### Phase 0 Renderer and coordinate spike

Reusable engine work:

- Replace the decorative region with one parsed GeoJSON polygon.
- Add a tested GeoJSON-to-world coordinate pipeline.
- Load one rough GLB terrain/map mesh outside the JavaScript bundle.
- Add one point marker, polygon, route, label, selection focus, and scripted camera move.
- Measure frame time, draw calls, bundle size, and asset transfer size on a representative desktop.
- Prove direct refresh of a selected battle deep link in a production build.

Black Empire content work:

- Supply deliberately rough, non-publishable geometry solely for the technical spike.
- Do not begin bulk lore entry.

Acceptance criteria:

- Orbit, pan, zoom, selection, and scripted focus work together.
- One validated GeoJSON region and route render in the correct coordinate location.
- Reloading a deep link restores era and selected marker.
- `pnpm build` produces a deployable static site.
- Measurements and the chosen coordinate convention are recorded in `docs/spikes/renderer.md`.

### Phase 1 Domain and data foundation

Reusable engine work:

- Complete schemas for spatial states, campaigns, routes, layers, citations, and claims.
- Replace manual fixture imports with generated manifests.
- Add validation for all references, geometry bounds, duplicate slugs, missing citations, and causal cycles.
- Add repository selectors for era visibility and source filters.
- Generate a client search index.

Black Empire content work:

- Establish the source inventory for Chronicle Volume 1.
- Create a content glossary, editorial confidence rules, and citation conventions.
- Enter a very small reviewed sample: one era, two entities, one location, one event, and one claim.

Acceptance criteria:

- Content can be added without editing UI code.
- Every record parses and every cross-reference validates in CI.
- Reviewed claims display at least one resolvable citation.
- Placeholder and research records can be excluded from a production build.

### Phase 2 Explorer UI

Reusable engine work:

- Implement top-level era selection, curated era layers, selection state, labels, and permanent dossier views.
- Add loading, empty, error, keyboard focus, and WebGL-unavailable states.
- Implement URL synchronization for era and selection.

Black Empire content work:

- Add reviewed primary region/domain geometry, 10-20 important records, and initial labels.
- Define the era's default layer set and label priorities.

Acceptance criteria:

- A user can enter Black Empire, navigate the map, see the curated historical layers, and open dossiers.
- Dossiers remain usable without interacting with the 3D canvas.
- Shared URLs restore the same era and selection.

### Phase 3 Battle system

Reusable engine work:

- Complete battle, combatant, objective, phase, outcome, and certainty UI.
- Add importance and certainty markers that do not rely on color alone.
- Implement deterministic phase playback with skip and reduced motion.

Black Empire content work:

- Add only conflicts supportable by reviewed sources.
- Create 3-6 dossiers if the source material actually supports that many.
- Author 3-5 routes/sequences with explicit certainty.

Acceptance criteria:

- At least one reviewed conflict can be opened, understood, played, skipped, and traced to citations.
- Unknown geography is not placed as an exact marker.
- Playback restart always produces the same result.

### Phase 4 Story engine

Reusable engine work:

- Complete StoryGuide/StoryNode navigation, camera instructions, VisualActions, branching, resume, and session persistence.
- Add deterministic entry/exit cleanup for story effects.
- Add integration and Playwright coverage.

Black Empire content work:

- Author one reviewed 8-15 node guide that explains the era and transition to the next state.
- Keep the required narrative as one continuous unnumbered sequence. Place optional character exploration and detailed conflict phases outside the tour.

Acceptance criteria:

- Experience the Era runs end-to-end.
- The map reacts to every node from data, not node-specific React code.
- The guide never opens a nested story or conflict playback; map dossiers remain independently accessible.
- Keyboard and reduced-motion users can complete the guide.

### Phase 5 Causality and sources

Reusable engine work:

- Implement cause/consequence traversal and visualization.
- Add confidence, claim status, citations, and curated publication scope to dossiers and map selectors.
- Add disputed/superseded claim presentation rules.

Black Empire content work:

- Build one reviewed causal chain spanning the era.
- Review every important public assertion and inferred placement.

Acceptance criteria:

- A user can answer what led to an event and what changed because of it.
- Every graph edge can open its underlying record and provenance.
- Publication scoping excludes unsupported records consistently from the map and dossiers; visitors cannot disable the Chronicle source backbone.

### Phase 6 Public demo hardening

Reusable engine work:

- Profile and optimize render loops, labels, geometry, bundle chunks, and asset loading.
- Finish responsive desktop/tablet behavior, error boundaries, accessibility, analytics/privacy decision, and visual regression tests.
- Add optional dossier prerendering only if search/link-preview measurements justify it.
- Verify Render headers, cache behavior, SPA fallbacks, and pull-request previews.

Black Empire content work:

- Complete lore review, copy edit, citation audit, asset-origin audit, and unofficial-project notices.
- Remove or exclude every unreviewed fixture from production.

Acceptance criteria:

- All MVP Definition of Done scenarios pass in production.
- The useful scene appears within the measured performance budget on the target desktop profile.
- No important information is available only through color, motion, hover, or the 3D canvas.
- The public build contains no scans, bulk copied prose, unreviewed claims, or unlabeled inference.

## Immediate backlog status

1. [x] Add the renderer spike record at `docs/spikes/renderer.md`.
2. [x] Replace inline geometry with parsed GeoJSON fixtures.
3. [x] Build and test the Polygon, LineString, and Point geometry adapter.
4. [x] Add `CameraRig` and a cancellable story-camera command port.
5. [x] Add and measure a reproducible external GLB terrain fixture.
6. [x] Lazy-load the map route and inspect production chunks.
7. [x] Cover URL-to-selection synchronization.
8. [x] Add a dossier-linked WebGL fallback.
9. [x] Record the desktop performance profile and budgets.
10. [x] Create research, glossary, confidence, source-inventory, and citation-review documents.

### Next content-gated work

1. A human researcher records edition details and exact citation locations from Chronicle Volumes 1–4.
2. A human lore reviewer approves the first small era/entity/location/event/claim sample.
3. Reviewed records promote the research dataset through the generated manifest path; removed technical fixtures never return as lore.
4. Reviewed Black Empire geometry, battle dossiers, an 8–15 node guide, and a causal chain are authored only where those citations support them.
5. Final label-density, terrain, transfer, and visual measurements run against the reviewed content volume.
6. Deployment switches to `VITE_CONTENT_MODE=published` only when the published dataset passes the MVP completion gate; no placeholder or research records ship in that build.

## Technical risks and experiments

| Risk | Earliest experiment | Decision signal |
| --- | --- | --- |
| HTML labels become expensive or overlap heavily | Render 250 representative labels with priority rules | Move ambient labels to SDF if layout or frame time misses budget |
| GeoJSON triangulation produces artifacts | Test concave polygons and holes from QGIS exports | Adopt a preprocessing library/build step before content scales |
| Camera scripting fights OrbitControls | Cancel and resume animations under repeated user input | Separate free-camera and scripted-camera controllers if state leaks |
| React state causes frame-time spikes | Profile camera motion with React DevTools and browser performance tools | Keep all frame state in refs; expose settled events only |
| Static dossier pages lack useful previews | Test deployed links in target crawlers | Add build-time prerendering, not a server, if previews matter |
| Lore records become too fragmented | Conduct a review with 20 realistic records | Generate authoring manifests or adopt YAML without changing runtime schemas |
| Repository assets become too large | Measure clone, CI, deploy, and first-load sizes | Move hashed heavy assets behind an asset manifest/CDN |
| Uncertainty is mistaken for canon | User-test certainty markers and wording | Strengthen non-color indicators and block publishing without review metadata |

## MVP completion gate

The MVP is complete only when a new user can identify the Black Empire era, navigate the 3D world, inspect a character overview and sourced battle, complete one continuous guided story, inspect causes and consequences, distinguish certainty states, and reach the next historical state—while the same information remains accessible through permanent text-first routes.
