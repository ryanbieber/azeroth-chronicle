# Azeroth Chronicle Implementation Plan

## Outcome

Build the Black Empire vertical slice as a static, client-heavy historical atlas that proves four ideas together: a navigable 3D map, structured and source-aware lore records, data-driven guided history, and explicit causes and consequences. The MVP should be deployable from GitHub to Render without a server, database, authentication, or private credentials.

The reusable engine must not contain Black Empire-specific behavior. Black Empire records live in the data layer and exercise generic era, map-state, battle, story, source, and relationship systems.

## Current baseline

The repository now contains an executable architecture skeleton:

- A responsive application shell and React Three Fiber placeholder scene.
- Static routes for the atlas, era dossiers, and battle dossiers.
- Independent stores for era, selection, layers, story progress, and source filters.
- Stable TypeScript contracts plus Zod runtime schemas.
- A file-backed repository adapter that can later be replaced by an API adapter.
- Referential validation, unit tests, CI, and a Render static-site blueprint.
- Explicitly fictional fixture data marked `contentStatus: placeholder`.

This baseline is intentionally small. It proves module boundaries; it does not claim to complete Phase 0 or supply verified Warcraft lore.

## Architectural decisions

### Application and routing

- Use Vite, React, and strict TypeScript as a single-page application.
- Use React Router with permanent routes for `/eras/:slug`, `/battles/:slug`, `/events/:slug`, `/locations/:slug`, and `/factions/:slug`.
- Use `/map` query parameters for restorable explorer state: `era`, selected record, visible layers, and optionally a compact camera bookmark.
- Keep the 3D explorer client-rendered. Generate static dossier HTML only after measuring an actual search-indexing or link-preview need. If needed, add a build-time prerender step rather than a server runtime.
- Configure the static host to rewrite unknown routes to `/index.html` so browser refreshes work.

### State boundaries

- Keep durable content outside Zustand. The repository adapter owns content reads.
- Use small stores for `era`, `selection`, `layers`, `story`, `sourceFilter`, and later `mapView`.
- Treat the URL as shareable state and synchronize it at route boundaries, not every animation frame.
- Keep high-frequency camera and pointer state inside Three.js controls/refs. React stores receive only meaningful settled state.
- Persist story guide ID and node ID in session storage after the story behavior stabilizes. Do not persist transient animation progress.

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
- Branching into a dossier stores the guide/node return point. Returning restores the same node, not a restarted guide.
- Tests cover every action type, node transitions, skip behavior, and branch-and-return state.

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
- Testing Library: layer controls, dossier accessibility, guide progression, URL synchronization, and error states.
- Playwright in Phase 4: load Black Empire, select a marker, branch to a dossier, return to a guide, skip battle playback, inspect provenance, and finish the guide.
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

- Implement era selection, layer controls, selection state, search, labels, and permanent dossier views.
- Add loading, empty, error, keyboard focus, and WebGL-unavailable states.
- Implement URL synchronization for era, selection, and layers.

Black Empire content work:

- Add reviewed primary region/domain geometry, 10-20 important records, and initial labels.
- Define the era's default layer set and label priorities.

Acceptance criteria:

- A user can enter Black Empire, navigate the map, toggle four core layers, search, and open dossiers.
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
- Separate required narrative from optional rabbit holes.

Acceptance criteria:

- Experience the Era runs end-to-end.
- The map reacts to every node from data, not node-specific React code.
- Branching to a dossier and returning preserves the exact guide node.
- Keyboard and reduced-motion users can complete the guide.

### Phase 5 Causality and sources

Reusable engine work:

- Implement cause/consequence traversal and visualization.
- Add confidence, claim status, citations, and source filtering to dossiers and map selectors.
- Add disputed/superseded claim presentation rules.

Black Empire content work:

- Build one reviewed causal chain spanning the era.
- Review every important public assertion and inferred placement.

Acceptance criteria:

- A user can answer what led to an event and what changed because of it.
- Every graph edge can open its underlying record and provenance.
- Source filters remove unsupported records consistently from map, search, and dossiers.

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

## Immediate backlog

1. Add the renderer spike record template at `docs/spikes/renderer.md`.
2. Replace the inline placeholder region and route with the existing GeoJSON fixture.
3. Build a geometry adapter with unit tests for Polygon and LineString features.
4. Add a `CameraRig` and a cancellable story-camera command port.
5. Add a simple local GLB terrain asset and measure its load path.
6. Split the map route with `React.lazy` and inspect the production chunks.
7. Add integration tests for URL-to-selection synchronization.
8. Add a WebGL fallback that links to permanent dossiers.
9. Decide and document the first desktop performance test profile and budgets.
10. Create the human research-note template and citation review checklist before entering canon content.

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

The MVP is complete only when a new user can identify the Black Empire era, navigate the 3D world, control core layers, inspect a sourced battle, complete a guided story, branch and return without losing progress, inspect causes and consequences, distinguish certainty states, and reach the next historical state—while the same information remains accessible through permanent text-first routes.
