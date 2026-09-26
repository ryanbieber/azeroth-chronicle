# Decision: Tour-Led Public Experience

Status: accepted by product direction on 2026-09-25. This supersedes the public explorer controls described in `fixed-map-layers-and-chronicle-scope.md`.

## Context

The guided journey is now the primary experience. Free camera movement, clickable map figures, and inline dossiers interrupt the historical scene. Visitors still need a way to choose one era, follow the whole history, and inspect the original visual assets.

## Decision

- The landing page offers a full chronological tour and a selector for one era's tour.
- `/map?era=<slug>&tour=full|era` renders a guided, noninteractive scene. Bare legacy `/map` links return to the tour chooser.
- Story actions continue to drive camera, map state, labels, and figures. Visitors control narration, pause, Previous, Next, and leaving the tour, but cannot orbit, zoom, select map objects, or open inline dossiers.
- The archive gallery remains the public asset browser. Its detail view can show original lore and provenance alongside the assets, without links into the atlas or dossier routes.
- Permanent text-first dossier routes remain available by direct URL for accessibility, provenance, and existing links. They are no longer primary navigation.

## Consequences

The map renderer and record schema remain reusable internally. Shareable tour URLs preserve era and full-versus-single mode. Existing atlas deep links resolve to the tour chooser, while archive URLs continue to restore selected assets.
