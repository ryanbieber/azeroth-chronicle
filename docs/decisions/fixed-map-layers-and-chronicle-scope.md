# Decision: Curated Map Layers and Chronicle Source Scope

Status: accepted by product direction on 2026-09-13.

## Context

The initial explorer exposed general layer toggles and source filters. That made the atlas feel like a configurable data workbench and allowed users to hide the Chronicle source backbone. The intended experience is a guided journey through the Warcraft universe in which the map, battles, and history remain coherent and immediately visible.

## Decision

- Remove end-user layer toggles and the general controls drawer from the primary atlas.
- Remove end-user source filtering. Chronicle Volumes 1–4 remain the curated editorial source scope and cannot be switched off.
- Let each era's reviewed data define its visible baseline layers.
- Allow StoryNode and battle actions to reveal, focus, or emphasize map information as part of historical explanation.
- Continue displaying claim-level confidence, citations, disputes, and supersession in dossiers.
- Keep layer and source-filter engine boundaries internally so future editorial/debug tooling does not require a domain rewrite, but do not expose them as public browsing controls.

## Consequences

The map opens full-width with era and guided-tour navigation in the top bar. Selecting a record opens a dismissible history panel. Shared URLs restore era and selection, but no longer let a visitor disable curated layers. Source consistency is enforced during validation and publication rather than delegated to visitors.
