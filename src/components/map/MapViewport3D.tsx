import { Html, Line, OrbitControls, useGLTF, useTexture } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState, type ElementRef } from 'react';
import { Link } from 'react-router-dom';
import { Group, Path, Shape, ShapeGeometry, SRGBColorSpace, Vector2 } from 'three';
import { useLayerStore } from '../../app/state/layerStore';
import { useMapViewStore } from '../../app/state/mapViewStore';
import { useSelectionStore } from '../../app/state/selectionStore';
import { useSceneEffectsStore } from '../../app/state/sceneEffectsStore';
import type { Battle, LoreEntity, Route, SpatialState } from '../../domain/types/lore';
import type { RuntimeGeometry, RuntimePolygon } from '../../lib/map/geometryAdapter';
import { CameraRig } from './CameraRig';

interface MapViewport3DProps {
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

function ReliefTerrain({ textureAsset, heightAsset }: {
  textureAsset: string;
  heightAsset: string;
}) {
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

function RelationalField({ textureAsset }: { textureAsset: string }) {
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
      <meshBasicMaterial map={colorTexture} toneMapped={false} />
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

function CharacterFigure({ entity, active, onSelect }: { entity: LoreEntity; active: boolean; onSelect: () => void }) {
  if (!entity.mapFigure) return null;
  const width = Math.round(164 * (entity.mapFigure.scale ?? 1));
  return (
    <Html center position={[0, 1.02, 0]} distanceFactor={5} zIndexRange={[4, 1]}>
      <button className={`map-character-figure${active ? ' is-active' : ''}`} type="button" onClick={onSelect} aria-label={entity.name}>
        <img src={`${import.meta.env.BASE_URL}${entity.mapFigure.asset}`} alt="" width={width} />
        <span>{entity.name}</span>
      </button>
    </Html>
  );
}

function ContextualSubjectVisual({ entity, onSelect }: { entity: LoreEntity; onSelect: () => void }) {
  if (!entity.mapVisual) return null;
  const width = Math.round(174 * (entity.mapVisual.scale ?? 1));
  return (
    <Html center position={[0, 0.94, 0]} distanceFactor={5} zIndexRange={[4, 1]}>
      <button className="map-subject-visual is-active" type="button" onClick={onSelect} aria-label={entity.name}>
        <img src={`${import.meta.env.BASE_URL}${entity.mapVisual.asset}`} alt="" width={width} />
        <span>{entity.name}</span>
      </button>
    </Html>
  );
}

function AtlasScene({
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
  const regions = geometry.filter((item): item is RuntimePolygon => item.kind === 'polygon');
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
    const active = highlightedIds.includes(entity.id) || selectedId === entity.id;
    return runtime?.kind === 'point' ? [{ active, entity, runtime }] : [];
  }), [entities, geometry, highlightedIds, selectedId, spatialStates]);

  useEffect(() => {
    const focused = locations.find((item) => item.entity.id === focusedLocationId);
    if (!focused) return;
    const [x, , z] = focused.runtime.position;
    requestCamera({ position: [x, 4.2, z + 3.2], target: [x, 0, z], durationMs: 800 });
  }, [focusedLocationId, locations, requestCamera]);

  return (
    <>
      <color attach="background" args={['#07090d']} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 8, 2]} intensity={2.2} color="#dfbd79" />

      {presentation === 'relational' && terrainTextureAsset ? (
        <RelationalField textureAsset={terrainTextureAsset} />
      ) : terrainTextureAsset && terrainHeightAsset ? (
        <ReliefTerrain textureAsset={terrainTextureAsset} heightAsset={terrainHeightAsset} />
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
            <group onClick={(event) => { event.stopPropagation(); select({ kind: 'entity', id: entity.id }); }}>
              <ElementalPresence entityId={entity.id} />
            </group>
          )}
          {entity.mapVisual && (
            <ContextualSubjectVisual entity={entity} onSelect={() => select({ kind: 'entity', id: entity.id })} />
          )}
          {layers.labels && !entity.mapFigure && !entity.mapVisual && (
            <Html center position={[0, 0.38, 0]} distanceFactor={7}>
              <button className="map-label" type="button" onClick={() => select({ kind: 'entity', id: entity.id })}>{entity.name}</button>
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
          <CharacterFigure active={active} entity={entity} onSelect={() => select({ kind: 'entity', id: entity.id })} />
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
              onClick={(event) => {
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
                <button className="map-label" type="button" aria-label={`${battle.name}, ${battle.importance.replace('_', ' ')}`} onClick={() => select({ kind: 'battle', id: battle.id })}>
                  {battle.name}
                </button>
              </Html>
            )}
          </group>
        );
      })}

      <OrbitControls
        ref={controls}
        makeDefault
        enableDamping
        minDistance={4}
        maxDistance={13}
        maxPolarAngle={Math.PI / 2.25}
        onStart={cancelCamera}
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
        <p>Your browser could not start WebGL. The permanent dossiers remain fully available.</p>
        <Link to={props.fallbackDossierPath}>Open the era dossier</Link>
      </section>
    );
  }

  return (
    <div className="map-viewport" aria-label="Interactive three-dimensional historical map">
      <Canvas camera={{ position: [0, 5.6, 6.3], fov: 48 }} dpr={[1, 1.75]}>
        <Suspense fallback={null}>
          <AtlasScene {...props} />
          {profile && <PerformanceProbe onReport={setPerformanceReport} routeStartedAt={routeStartedAt} />}
        </Suspense>
      </Canvas>
      <div className="map-caption" aria-hidden="true">
        {props.cartographyLabel ?? 'ATLAS CARTOGRAPHY'} · DRAG TO ORBIT · SCROLL TO ZOOM
      </div>
      {profile && (
        <output className="performance-report" data-testid="performance-report">
          {performanceReport ? JSON.stringify(performanceReport) : 'Sampling renderer…'}
        </output>
      )}
    </div>
  );
}
