# Renderer and Coordinate Spike

## Purpose

Prove the reusable atlas path with deliberately fictional placeholder data before any bulk lore work. The spike covers parsed GeoJSON, an external terrain asset, selection, URL restoration, and scripted camera focus.

## Coordinate decision

- Source geometry is authored in a worldspace-local `0..10000` X/Y atlas plane.
- The authoring origin is recorded per worldspace; the current fixture uses bottom-left.
- Runtime conversion is centralized in `atlasToWorld` and maps the source plane to a centered `10 × 10` Three.js X/Z plane.
- Three.js Y is reserved for terrain elevation and overlay separation.
- Source coordinates are never described as latitude or longitude.
- GeoJSON remains unchanged. Runtime geometry is derived in memory by the tested geometry adapter.

For the bottom-left fixture, `(0, 0)` becomes `(-5, 0, 5)`, `(5000, 5000)` becomes `(0, 0, 0)`, and `(10000, 10000)` becomes `(5, 0, -5)`.

## Implemented spike path

- The region, campaign route, and marker position are parsed from `data/geometry/black-empire-region.placeholder.geojson`.
- Polygon rings and LineString paths pass through the same bounds-checked coordinate adapter.
- A reproducible 868-byte placeholder GLB loads from `public/models/azeroth/black-empire-map-placeholder/`, outside the JavaScript bundle.
- OrbitControls supplies bounded orbit, pan, and zoom.
- Story nodes issue cancellable camera commands through the separate map-view store. User input cancels interpolation; reduced-motion users land immediately at the final pose.
- Map URLs restore era, selection, and layer visibility. Legacy `battle=` links remain readable and serialize to the generic `selected=` form.
- A WebGL-unavailable state links directly to the permanent battle dossier.

## Representative desktop profile and budgets

The first target profile is a 1920×1080 viewport, device-pixel ratio 1, current stable Chromium, a four-core desktop CPU, and an integrated or entry-level discrete GPU. Measure after a cold page load with browser cache disabled, followed by a 20-second warm orbit sample.

| Signal | Phase 0 budget | Measurement method |
| --- | ---: | --- |
| Warm orbit median frame time | ≤ 16.7 ms | Browser performance trace |
| Warm orbit 95th percentile frame time | ≤ 25 ms | Browser performance trace |
| Draw calls in the placeholder scene | ≤ 25 | `renderer.info.render.calls` |
| Initial compressed JavaScript | ≤ 450 kB | Vite gzip report, all initially requested chunks |
| Lazy map compressed JavaScript | ≤ 350 kB | Vite gzip report |
| Single terrain transfer | ≤ 10 MB | Network transfer size |
| Useful scene after navigation | ≤ 2.5 s | Performance mark from route entry to first settled frame |

## Production build measurement — 2026-09-12

| Artifact | Raw | Gzip |
| --- | ---: | ---: |
| Initial application JavaScript | 364.46 kB | 112.35 kB |
| Lazy map JavaScript | 1,024.39 kB | 275.67 kB |
| Application CSS | 6.38 kB | 2.09 kB |
| Placeholder terrain GLB | 868 B | n/a |

The automated Chromium profile at 1920×1080 and DPR 1 sampled 180 warm frames: **16.7 ms median**, **16.9 ms p95**, and **5 draw calls**. The production deep-link test also confirmed an HTTP 200 terrain response and preserved era, selection, and layer state across reload.

The initial, lazy-map, terrain-transfer, frame-time, and draw-call budgets pass. Vite reports the map chunk as larger than 500 kB raw because it contains the Three.js renderer; it remains route-split and below the compressed transfer budget.

## Decision

Retain the local atlas coordinate convention, parsed GeoJSON path, external map-state terrain URL, and separate camera command port. Do not introduce projection libraries, continent morphing, or React per-frame state. Revisit geometry preprocessing when realistic concave polygons and holes are available, and revisit HTML labels at 250 representative labels.
