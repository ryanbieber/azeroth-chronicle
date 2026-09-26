import { Html, Line, OrbitControls, useGLTF, useTexture } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState, type ElementRef } from 'react';
import { Link } from 'react-router-dom';
import { DataTexture, Group, LinearFilter, Path, PerspectiveCamera, RGBAFormat, Shape, ShapeGeometry, SRGBColorSpace, Vector2 } from 'three';
import { useLayerStore } from '../../app/state/layerStore';
import { useMapViewStore } from '../../app/state/mapViewStore';
import { useSelectionStore } from '../../app/state/selectionStore';
import { useSceneEffectsStore } from '../../app/state/sceneEffectsStore';
import type { Battle, LoreEntity, Route, SpatialState } from '../../domain/types/lore';
import type { RuntimeGeometry, RuntimePolygon } from '../../lib/map/geometryAdapter';
import { layoutMapFigures, type ScreenRect } from '../../lib/map/layoutMapFigures';
import { CameraRig } from './CameraRig';

interface MapViewport3DProps {
  immersive?: boolean;
  readOnly?: boolean;
  battles: Battle[];
  geometry: RuntimeGeometry[];
  terrainAsset?: string;
  terrainTextureAsset?: string;
  terrainHeightAsset?: string;
  presentation?: 'terrain' | 'relational';
  entities: LoreEntity[];
  routeRecords: Route[];
  spatialStates: SpatialState[];
  fallbackDossierPath: string;
  cartographyLabel?: string;
}

interface PerformanceReport {
  renderer: string;
  medianFrameMs: number;
  p95FrameMs: number;
  drawCalls: number;
  sampleFrames: number;
  usefulSceneMs: number;
}

function PerformanceProbe({ onReport, routeStartedAt }: {
  onReport: (report: PerformanceReport) => void;
  routeStartedAt: number;
}) {
  const samples = useRef<number[]>([]);
  const warmupFrames = useRef(0);
  const reported = useRef(false);
  const usefulSceneMs = useRef<number | null>(null);

  useFrame(({ gl }, delta) => {
    usefulSceneMs.current ??= performance.now() - routeStartedAt;
    if (reported.current) return;
    if (warmupFrames.current < 30) {
      warmupFrames.current += 1;
      return;
    }
    samples.current.push(delta * 1000);
    if (samples.current.length < 90) return;
    const sorted = [...samples.current].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
    const context = gl.getContext();
    const debugInfo = context.getExtension('WEBGL_debug_renderer_info');
    reported.current = true;
    onReport({
      renderer: debugInfo
        ? String(context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
        : 'Renderer information unavailable',
      medianFrameMs: Number(median.toFixed(2)),
      p95FrameMs: Number(p95.toFixed(2)),
      drawCalls: gl.info.render.calls,
      sampleFrames: samples.current.length,
      usefulSceneMs: Number((usefulSceneMs.current ?? 0).toFixed(2)),
    });
  });

  return null;
}

function StoryFraming({ immersive }: { immersive: boolean }) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const baseFov = useRef(camera instanceof PerspectiveCamera ? camera.fov : 48);
  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;
    // Frame the authored camera above the transcript without moving map anchors.
    const fov = baseFov.current;
    const focalLength = camera.getFilmHeight() / (2 * Math.tan(fov * Math.PI / 360));
    const landscape = size.width > size.height;
    camera.setFocalLength(focalLength * (immersive ? (landscape ? 1.65 : 1.12) : 1));
    if (immersive) camera.setViewOffset(size.width, size.height, 0, size.height * 0.12, size.width, size.height);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    return () => {
      camera.setFocalLength(camera.getFilmHeight() / (2 * Math.tan(fov * Math.PI / 360)));
      camera.clearViewOffset();
    };
  }, [camera, immersive, size.width, size.height]);
  return null;
}

function projectedRect(element: HTMLElement): { rect: ScreenRect; scale: number } {
  const image = element.getBoundingClientRect();
  const label = element.querySelector('span')?.getBoundingClientRect();
  const x = Math.min(image.left, label?.left ?? image.left);
  const y = Math.min(image.top, label?.top ?? image.top);
  const right = Math.max(image.right, label?.right ?? image.right);
  const bottom = Math.max(image.bottom, label?.bottom ?? image.bottom);
  const scale = element.offsetWidth > 0 ? image.width / element.offsetWidth : 1;
  const previousX = Number(element.dataset.layoutCssX ?? 0) * scale;
  const previousY = Number(element.dataset.layoutCssY ?? 0) * scale;
  return { rect: { x: x - previousX, y: y - previousY, width: right - x, height: bottom - y }, scale };
}

function MapFigureLayout() {
  const lastLayout = useRef(0);
  useFrame(({ clock, gl }) => {
    if (clock.elapsedTime - lastLayout.current < 0.08) return;
    lastLayout.current = clock.elapsedTime;
    const viewport = gl.domElement.closest('.map-viewport');
    if (!viewport) return;
    const bounds = viewport.getBoundingClientRect();
    const frame = { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
    const figures = [...viewport.querySelectorAll<HTMLElement>('.map-character-figure, .map-subject-visual, .map-label')]
      .map((element) => ({ element, ...projectedRect(element) }))
      .filter(({ rect }) => rect.width > 0 && rect.height > 0
        && rect.x + rect.width > frame.x && rect.x < frame.x + frame.width
        && rect.y + rect.height > frame.y && rect.y < frame.y + frame.height)
      .sort((a, b) => Number(b.element.classList.contains('is-active')) - Number(a.element.classList.contains('is-active')));
    const obstacles = [...viewport.parentElement?.querySelectorAll<HTMLElement>('.story-overlay .story-card, .story-world-header, .selection-overlay') ?? []]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      });
    const offsets = layoutMapFigures(figures.map(({ rect }) => rect), frame, obstacles);
    figures.forEach(({ element, scale }, index) => {
      const offset = offsets[index] ?? { x: 0, y: 0 };
      const cssX = Math.round(offset.x / scale);
      const cssY = Math.round(offset.y / scale);
      if (element.dataset.layoutCssX === String(cssX) && element.dataset.layoutCssY === String(cssY)) return;
      element.style.translate = `${cssX}px ${cssY}px`;
      element.dataset.layoutCssX = String(cssX);
      element.dataset.layoutCssY = String(cssY);
    });
  });
  return null;
}

function RegionMesh({ region, highlighted }: { region: RuntimePolygon; highlighted: boolean }) {
  const shapeGeometry = useMemo(() => {
    const [outer, ...holes] = region.rings;
    if (!outer) return null;
    const shape = new Shape(outer.map(([x, , z]) => new Vector2(x, -z)));
    shape.holes = holes.map((ring) => new Path(ring.map(([x, , z]) => new Vector2(x, -z))));
    const result = new ShapeGeometry(shape);
    result.rotateX(-Math.PI / 2);
    return result;
  }, [region]);

  useEffect(() => () => shapeGeometry?.dispose(), [shapeGeometry]);
  if (!shapeGeometry) return null;

  const style = {
    landmass: { color: '#7d8879', opacity: 0.018, height: 0.025, outline: '#758074' },
    influence: { color: '#6e3d55', opacity: 0.055, height: 0.065, outline: '#b58a77' },
    region: { color: '#75465d', opacity: 0.11, height: 0.05, outline: '#ad806e' },
  }[region.styleRole];

  return (
    <group>
      <mesh geometry={shapeGeometry} position={[0, style.height, 0]}>
        <meshBasicMaterial color={highlighted ? '#9a6c71' : style.color} transparent opacity={highlighted ? 0.085 : style.opacity} depthWrite={false} />
      </mesh>
      {region.rings.map((ring, index) => (
        <Line
          key={`${region.id}-outline-${index}`}
          points={ring.map(([x, , z]) => [x, style.height + 0.018, z])}
          color={highlighted ? '#e3c59b' : style.outline}
          lineWidth={highlighted ? 1.8 : 0.85}
          dashed={region.geographicCertainty === 'inferred'}
          dashSize={0.08}
          gapSize={0.07}
        />
      ))}
    </group>
  );
}

function Terrain({ asset }: { asset: string }) {
  const url = `${import.meta.env.BASE_URL}${asset}`;
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

// Fade only the authored surface boundary; keep its geography and UVs intact.
function useEnvironmentEdgeFade() {
  const texture = useMemo(() => {
    const size = 128;
    const pixels = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const edge = Math.min(x, y, size - 1 - x, size - 1 - y) / (size - 1);
        const t = Math.min(1, edge / 0.16);
        const opacity = Math.round(t * t * (3 - 2 * t) * 255);
        pixels.set([opacity, opacity, opacity, 255], (y * size + x) * 4);
      }
    }
    const result = new DataTexture(pixels, size, size, RGBAFormat);
    result.magFilter = LinearFilter;
    result.minFilter = LinearFilter;
    result.needsUpdate = true;
    return result;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function ReliefTerrain({ textureAsset, heightAsset, immersive }: {
  textureAsset: string;
  heightAsset: string;
  immersive?: boolean;
}) {
  const edgeFade = useEnvironmentEdgeFade();
  const textureUrl = `${import.meta.env.BASE_URL}${textureAsset}`;
  const heightUrl = `${import.meta.env.BASE_URL}${heightAsset}`;
  const [texture, height] = useTexture([textureUrl, heightUrl]);
  const colorTexture = useMemo(() => {
    if (!texture) return undefined;
    const copy = texture.clone();
    copy.colorSpace = SRGBColorSpace;
    copy.needsUpdate = true;
    return copy;
  }, [texture]);
  useEffect(() => () => colorTexture?.dispose(), [colorTexture]);
  if (!colorTexture || !height) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
      <planeGeometry args={[10, 6.67, 96, 64]} />
      <meshStandardMaterial
        alphaMap={immersive ? edgeFade : null}
        transparent={immersive}
        map={colorTexture}
        displacementMap={height}
        displacementScale={0.24}
        displacementBias={-0.06}
        roughness={0.9}
        metalness={0.02}
      />
    </mesh>
  );
}

function RelationalField({ textureAsset, immersive }: { textureAsset: string; immersive?: boolean }) {
  const edgeFade = useEnvironmentEdgeFade();
  const texture = useTexture(`${import.meta.env.BASE_URL}${textureAsset}`);
  const colorTexture = useMemo(() => {
    const copy = texture.clone();
    copy.colorSpace = SRGBColorSpace;
    copy.needsUpdate = true;
    return copy;
  }, [texture]);
  useEffect(() => () => colorTexture.dispose(), [colorTexture]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.14, 0]}>
      <planeGeometry args={[10, 6.67]} />
      <meshBasicMaterial map={colorTexture} toneMapped={false} alphaMap={immersive ? edgeFade : null} transparent={immersive} />
    </mesh>
  );
}

function ElementalPresence({ entityId }: { entityId: string }) {
  const group = useRef<Group>(null);
  const reducedMotion = useMemo(() => typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, []);
  useFrame((_, delta) => {
    if (group.current && !reducedMotion) group.current.rotation.y += delta * 0.55;
  });

  if (entityId === 'ragnaros') {
    return (
      <group ref={group}>
        <pointLight color="#ff5a24" intensity={1.8} distance={2.2} />
        <mesh position={[0, 0.16, 0]}>
          <coneGeometry args={[0.23, 0.62, 7]} />
          <meshStandardMaterial color="#e13f1f" emissive="#a61f08" emissiveIntensity={1.4} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <octahedronGeometry args={[0.14]} />
          <meshBasicMaterial color="#ffd06b" />
        </mesh>
      </group>
    );
  }
  if (entityId === 'alakir') {
    return (
      <group ref={group} position={[0, 0.28, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.22, 0.035, 8, 28]} /><meshStandardMaterial color="#d9edf1" emissive="#6f9da8" /></mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.16, 0.025, 8, 24]} /><meshStandardMaterial color="#9fcad2" emissive="#4b7681" /></mesh>
      </group>
    );
  }
  if (entityId === 'therazane') {
    return (
      <group ref={group} position={[0, 0.26, 0]}>
        <mesh><dodecahedronGeometry args={[0.25, 0]} /><meshStandardMaterial color="#8b6a44" emissive="#3d2816" roughness={1} /></mesh>
        <mesh position={[0.08, 0.12, 0.08]}><octahedronGeometry args={[0.08]} /><meshBasicMaterial color="#e3bd73" /></mesh>
      </group>
    );
  }
  if (entityId === 'neptulon') {
    return (
      <group ref={group} position={[0, 0.28, 0]}>
        <mesh><sphereGeometry args={[0.21, 18, 12]} /><meshStandardMaterial color="#287a9a" emissive="#123f58" transparent opacity={0.9} /></mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.27, 0.025, 8, 30]} /><meshBasicMaterial color="#8fe5ed" /></mesh>
      </group>
    );
  }
  return (
    <mesh position={[0, 0.15, 0]}>
      <cylinderGeometry args={[0.12, 0.18, 0.3, 6]} />
      <meshStandardMaterial color="#fff1c8" />
    </mesh>
  );
}

// Keep illustrated actors readable without enlarging them with cinematic framing.
function useFigureDistanceFactor(immersive?: boolean) {
  // Cinematic cameras can approach anchors closely. Keep tour portraits at their
  // authored screen size so crowded chapters still have room for every name.
  return immersive ? undefined : 5;
}

function CharacterFigure({ entity, active, immersive, readOnly, onSelect }: { entity: LoreEntity; active: boolean; immersive?: boolean; readOnly?: boolean; onSelect: () => void }) {
  const distanceFactor = useFigureDistanceFactor(immersive);
  if (!entity.mapFigure) return null;
  const width = Math.round(132 * (entity.mapFigure.scale ?? 1));
  const content = <><img src={`${import.meta.env.BASE_URL}${entity.mapFigure.asset}`} alt="" width={width} /><span>{entity.name}</span></>;
  return (
    <Html center position={[0, 1.02, 0]} distanceFactor={distanceFactor} zIndexRange={[4, 1]}>
      {readOnly
        ? <div className={`map-character-figure${active ? ' is-active' : ''}`} aria-label={entity.name}>{content}</div>
        : <button className={`map-character-figure${active ? ' is-active' : ''}`} type="button" onClick={onSelect} aria-label={entity.name}>{content}</button>}
    </Html>
  );
}

function ContextualSubjectVisual({ entity, immersive, readOnly, onSelect }: { entity: LoreEntity; immersive?: boolean; readOnly?: boolean; onSelect: () => void }) {
  const distanceFactor = useFigureDistanceFactor(immersive);
  if (!entity.mapVisual) return null;
  const width = Math.round(140 * (entity.mapVisual.scale ?? 1));
  const content = <><img src={`${import.meta.env.BASE_URL}${entity.mapVisual.asset}`} alt="" width={width} /><span>{entity.name}</span></>;
  return (
    <Html center position={[0, 0.94, 0]} distanceFactor={distanceFactor} zIndexRange={[4, 1]}>
      {readOnly
        ? <div className="map-subject-visual is-active" aria-label={entity.name}>{content}</div>
        : <button className="map-subject-visual is-active" type="button" onClick={onSelect} aria-label={entity.name}>{content}</button>}
    </Html>
  );
}

function AtlasScene({
  immersive,
  readOnly,
  battles,
  geometry,
  terrainAsset,
  terrainTextureAsset,
  terrainHeightAsset,
  presentation,
  entities,
  routeRecords,
  spatialStates,
}: MapViewport3DProps) {
  const layers = useLayerStore((state) => state.visible);
  const select = useSelectionStore((state) => state.select);
  const selectedId = useSelectionStore((state) => state.selection?.id);
  const cancelCamera = useMapViewStore((state) => state.cancelCamera);
  const requestCamera = useMapViewStore((state) => state.requestCamera);
  const highlightedIds = useSceneEffectsStore((state) => state.highlightedIds);
  const requestedRouteIds = useSceneEffectsStore((state) => state.routeIds);
  const focusedLocationId = useSceneEffectsStore((state) => state.focusedLocationId);
  const controls = useRef<ElementRef<typeof OrbitControls>>(null);
  // Broad research polygons suggest borders and control that the sources do not establish.
  // Keep only the landmass silhouette; factions and events appear through their figures and anchors.
  const regions = geometry.filter((item): item is RuntimePolygon => item.kind === 'polygon' && item.styleRole === 'landmass');
  const routeGeometry = geometry.filter((item) => item.kind === 'line');
  const locations = useMemo(() => spatialStates.flatMap((state) => {
    const runtime = geometry.find((item) => item.id === state.geometryId && item.kind === 'point');
    const entity = entities.find((item) => item.id === state.entityId);
    return runtime?.kind === 'point' && entity ? [{ state, runtime, entity }] : [];
  }).sort((a, b) => (b.state.labelPriority ?? 0) - (a.state.labelPriority ?? 0)).slice(0, 80), [entities, geometry, spatialStates]);
  const characterFigures = useMemo(() => entities.flatMap((entity) => {
    if (entity.type !== 'character' || !entity.mapFigure) return [];
    const anchorId = entity.mapFigure.anchorEntityId ?? entity.id;
    const anchorState = spatialStates.find((state) => state.entityId === anchorId);
    const runtime = geometry.find((item) => item.id === anchorState?.geometryId && item.kind === 'point');
    const active = highlightedIds.includes(entity.id) || selectedId === entity.id
      || (immersive === true && battles.some((battle) => (battle.id === selectedId || highlightedIds.includes(battle.id))
        && battle.participantEntityIds?.includes(entity.id)));
    if (immersive && !active) return [];
    if (anchorState?.visualPresence === 'contextual' && !active) return [];
    return runtime?.kind === 'point' ? [{ active, entity, runtime }] : [];
  }), [battles, entities, geometry, highlightedIds, immersive, selectedId, spatialStates]);

  useEffect(() => {
    const focused = locations.find((item) => item.entity.id === focusedLocationId);
    if (!focused) return;
    const [x, , z] = focused.runtime.position;
    requestCamera({ position: [x, 4.2, z + 3.2], target: [x, 0, z], durationMs: 800 });
  }, [focusedLocationId, locations, requestCamera]);

  return (
    <>
      {!immersive && <color attach="background" args={['#07090d']} />}
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 8, 2]} intensity={2.2} color="#dfbd79" />

      {presentation === 'relational' && terrainTextureAsset ? (
        <RelationalField textureAsset={terrainTextureAsset} immersive={immersive} />
      ) : terrainTextureAsset && terrainHeightAsset ? (
        <ReliefTerrain textureAsset={terrainTextureAsset} heightAsset={terrainHeightAsset} immersive={immersive} />
      ) : terrainAsset ? (
        <Terrain asset={terrainAsset} />
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#171d1b" roughness={0.92} metalness={0.08} />
        </mesh>
      )}

      {layers.regions && regions.filter((region) => {
        const owner = spatialStates.find((state) => state.geometryId === region.id)?.entityId;
        return highlightedIds.includes(region.id)
          || Boolean(owner && (highlightedIds.includes(owner) || selectedId === owner));
      }).map((region) => {
        const owner = spatialStates.find((state) => state.geometryId === region.id)?.entityId;
        return <RegionMesh key={region.id} region={region} highlighted={highlightedIds.includes(region.id) || Boolean(owner && highlightedIds.includes(owner))} />;
      })}

      {layers.routes && requestedRouteIds.length > 0 && routeGeometry.filter((route) => {
        return routeRecords.some((record) => requestedRouteIds.includes(record.id) && record.geometryId === route.id);
      }).map((route) => (
        <Line
          key={route.id}
          points={route.points.map(([x, , z]) => [x, 0.13, z])}
          color="#d4a64e"
          lineWidth={2.2}
          dashed
          dashSize={0.18}
          gapSize={0.1}
        />
      ))}

      {layers.locations && locations.filter(({ entity }) =>
        highlightedIds.includes(entity.id) || focusedLocationId === entity.id || selectedId === entity.id,
      ).map(({ state, runtime, entity }) => {
        const inContext = highlightedIds.includes(entity.id) || focusedLocationId === entity.id || selectedId === entity.id;
        return (
        <group key={state.id} position={[runtime.position[0], 0.2, runtime.position[2]]}>
          {inContext && presentation !== 'relational' && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.14, 0]}>
              <ringGeometry args={[0.24, 0.34, 24]} />
              <meshBasicMaterial color="#fff1c8" depthTest={false} />
            </mesh>
          )}
          {presentation !== 'relational' && !entity.mapFigure && !entity.mapVisual && (
            <group onClick={readOnly ? undefined : (event) => { event.stopPropagation(); select({ kind: 'entity', id: entity.id }); }}>
              <ElementalPresence entityId={entity.id} />
            </group>
          )}
          {entity.mapVisual && (
            <ContextualSubjectVisual immersive={immersive} readOnly={readOnly} entity={entity} onSelect={() => select({ kind: 'entity', id: entity.id })} />
          )}
          {layers.labels && !entity.mapFigure && !entity.mapVisual && (
            <Html center position={[0, 0.38, 0]} distanceFactor={7}>
              {readOnly
                ? <span className="map-label">{entity.name}</span>
                : <button className="map-label" type="button" onClick={() => select({ kind: 'entity', id: entity.id })}>{entity.name}</button>}
            </Html>
          )}
        </group>
        );
      })}

      {layers.locations && characterFigures.map(({ active, entity, runtime }) => (
        <group key={`figure-${entity.id}`} position={[runtime.position[0], 0.18, runtime.position[2]]}>
          {active && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
              <ringGeometry args={[0.27, 0.32, 32]} />
              <meshBasicMaterial color="#d7b777" transparent opacity={0.5} depthTest={false} />
            </mesh>
          )}
          <CharacterFigure immersive={immersive} readOnly={readOnly} active={active} entity={entity} onSelect={() => select({ kind: 'entity', id: entity.id })} />
        </group>
      ))}

      {layers.battles && battles.filter((battle) =>
        battle.geographicCertainty !== 'unknown'
        && (selectedId === battle.id || highlightedIds.includes(battle.id)),
      ).map((battle) => {
        const point = geometry.find((item) => item.kind === 'point' && item.id === battle.geometryId);
        const position = battle.position ?? (point?.kind === 'point'
          ? [point.position[0], 0.35, point.position[2]] as [number, number, number]
          : null);
        if (!position) return null;
        const selected = selectedId === battle.id;
        return (
          <group key={battle.id} position={position}>
            {selected && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
                <ringGeometry args={[0.34, 0.46, 24]} />
                <meshBasicMaterial color="#fff1c8" depthTest={false} />
              </mesh>
            )}
            <mesh
              onClick={readOnly ? undefined : (event) => {
                event.stopPropagation();
                select({ kind: 'battle', id: battle.id });
              }}
              scale={selected ? 1.25 : 1}
            >
              {battle.importance === 'minor' && <sphereGeometry args={[0.2, 8, 6]} />}
              {battle.importance === 'major' && <octahedronGeometry args={[0.24]} />}
              {battle.importance === 'era_defining' && <coneGeometry args={[0.24, 0.5, 5]} />}
              <meshStandardMaterial color={selected ? '#ffe0a0' : '#be493d'} emissive="#5b100d" />
            </mesh>
            {layers.labels && (
              <Html center position={[0, 0.52, 0]} distanceFactor={7}>
                {readOnly
                  ? <span className="map-label">{battle.name}</span>
                  : <button className="map-label" type="button" aria-label={`${battle.name}, ${battle.importance.replace('_', ' ')}`} onClick={() => select({ kind: 'battle', id: battle.id })}>{battle.name}</button>}
              </Html>
            )}
          </group>
        );
      })}

      <OrbitControls
        ref={controls}
        enabled={!readOnly}
        makeDefault
        enableDamping
        minDistance={4}
        maxDistance={13}
        maxPolarAngle={Math.PI / 2.25}
        onStart={readOnly ? undefined : cancelCamera}
      />
      <CameraRig controls={controls} />
    </>
  );
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function MapViewport3D(props: MapViewport3DProps) {
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null);
  const [profile] = useState(() => new URLSearchParams(window.location.search).get('profile') === '1');
  const [routeStartedAt] = useState(() => performance.now());

  if (!supportsWebGL()) {
    return (
      <section className="map-fallback" role="status">
        <p className="eyebrow">Text-first atlas</p>
        <h2>3D map unavailable</h2>
        <p>Your browser could not start WebGL. The illustrated archive remains available.</p>
        <Link to={props.fallbackDossierPath}>Open the archive gallery</Link>
      </section>
    );
  }

  return (
    <div className="map-viewport" data-environment={props.presentation ?? 'terrain'} aria-label={props.readOnly ? 'Guided historical scene' : 'Interactive three-dimensional historical map'}>
      {props.immersive && props.terrainTextureAsset && (
        <div className="story-atmosphere" aria-hidden="true" key={props.terrainTextureAsset}>
          <img src={`${import.meta.env.BASE_URL}${props.terrainTextureAsset}`} alt="" />
        </div>
      )}
      <Canvas camera={{ position: [0, 5.6, 6.3], fov: 48 }} dpr={[1, 1.75]} style={props.readOnly ? { pointerEvents: 'none' } : undefined}>
        <StoryFraming immersive={Boolean(props.immersive)} />
        <Suspense fallback={null}>
          <AtlasScene {...props} />
          <MapFigureLayout />
          {profile && <PerformanceProbe onReport={setPerformanceReport} routeStartedAt={routeStartedAt} />}
        </Suspense>
      </Canvas>
      <div className="map-caption" aria-hidden="true">
        {props.cartographyLabel ?? 'ATLAS CARTOGRAPHY'}{props.readOnly ? '' : ' · DRAG TO ORBIT · SCROLL TO ZOOM'}
      </div>
      {profile && (
        <output className="performance-report" data-testid="performance-report">
          {performanceReport ? JSON.stringify(performanceReport) : 'Sampling renderer…'}
        </output>
      )}
    </div>
  );
}
