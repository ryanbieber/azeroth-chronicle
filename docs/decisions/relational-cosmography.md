# Relational cosmography for non-geographic eras

**Status:** Accepted for the Cosmic Origins research slice  
**Date:** 2026-09-14

## Context

The historical atlas currently renders every map state as terrain and describes every positioned entity through geographic certainty. That contract is appropriate for Azeroth, but it is misleading for the cosmological account in *World of Warcraft: Chronicle Volume 1*. Light, Shadow, the Great Dark Beyond, the Twisting Nether, world-souls, the titans, and the Void Lords are not territories that can be plotted together at a meaningful physical scale.

Leaving Era 0 on an empty terrain plane would fail to explain its history. Plotting cosmic subjects as ordinary geographic regions would imply distances, borders, and locations that the source does not establish.

## Decision

- `MapState` gains a generic `presentation` field with `terrain` and `relational` values, plus an optional public `cartographyLabel` and `interpretationNote`.
- A relational map state uses a flat illustrated field. It does not use a height map, territorial region fill, or terrain language.
- `SpatialState` gains a generic `placementKind` field with `geographic` and `relational` values. Relational placement may have a point geometry, but must have an editor note explaining what the diagrammatic position communicates.
- `LoreEntity.featuredEraIds` may curate an entity into specific era indexes without falsely using `lastEraId` to claim that an enduring cosmic subject ceased to exist. Entities without that field retain the existing first/last-era visibility behavior.
- Relational points communicate narrative sequence and conceptual association only. They never communicate physical distance, direction, size, control, or a canonical coordinate.
- The renderer and page consume these fields without checking a particular era ID. Future non-geographic scenes may reuse the same contract.
- Permanent dossiers remain the source-aware text-first representation. The cosmography is an interpretive visual index, not a substitute for provenance.

## Consequences

The Cosmic Origins story can focus and reveal concepts and characters on a coherent visual field without laundering editorial composition into canon geography. Terrain eras continue to use the existing path. Validation prevents a relational point from shipping without its interpretive note, and prevents a relational map state from using terrain displacement.

The first implementation remains deliberately small: one illustrated plane, point anchors, existing character figures, story actions, and ordinary dossier selection. Lines between concepts are deferred until a source-reviewed relationship needs a distinct visual treatment.
