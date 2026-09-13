import { Html, Line, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState, type ElementRef } from 'react';
import { Link } from 'react-router-dom';
import { Path, Shape, ShapeGeometry, Vector2 } from 'three';
import { useLayerStore } from '../../app/state/layerStore';
import { useMapViewStore } from '../../app/state/mapViewStore';
import { useSelectionStore } from '../../app/state/selectionStore';
import { useSceneEffectsStore } from '../../app/state/sceneEffectsStore';
import type { Battle, LoreEntity, Route, SpatialState } from '../../domain/types/lore';
import type { RuntimeGeometry, RuntimePolygon } from '../../lib/map/geometryAdapter';
import { CameraRig } from './CameraRig';

interface MapViewport3DProps {
  battle: Battle;
  geometry: RuntimeGeometry[];
  terrainAsset?: string;
  battleVisible?: boolean;
  entities: LoreEntity[];
  routeRecords: Route[];
  spatialStates: SpatialState[];
}

interface PerformanceReport {
  medianFrameMs: number;
  p95FrameMs: number;
  drawCalls: number;
  sampleFrames: number;
  usefulSceneMs: number;
}

function PerformanceProbe({ onReport }: { onReport: (report: PerformanceReport) => void }) {
  const samples = useRef<number[]>([]);
  const reported = useRef(false);
  const usefulSceneMs = useRef<number | null>(null);

  useFrame(({ gl }, delta) => {
    usefulSceneMs.current ??= performance.now();
    if (reported.current || delta > 0.25) return;
    samples.current.push(delta * 1000);
    if (samples.current.length < 180) return;
    const sorted = [...samples.current].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
    reported.current = true;
    onReport({
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

  return (
    <mesh geometry={shapeGeometry} position={[0, 0.045, 0]}>
      <meshBasicMaterial color={highlighted ? '#966b8c' : '#5c3150'} transparent opacity={highlighted ? 0.72 : 0.52} depthWrite={false} />
    </mesh>
  );
}

function Terrain({ asset }: { asset: string }) {
  const url = `${import.meta.env.BASE_URL}${asset}`;
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function AtlasScene({
  battle,
  geometry,
  terrainAsset,
  battleVisible = true,
  entities,
  routeRecords,
  spatialStates,
}: MapViewport3DProps) {
  const layers = useLayerStore((state) => state.visible);
  const select = useSelectionStore((state) => state.select);
  const selected = useSelectionStore((state) => state.selection?.id === battle.id);
  const cancelCamera = useMapViewStore((state) => state.cancelCamera);
  const requestCamera = useMapViewStore((state) => state.requestCamera);
  const highlightedIds = useSceneEffectsStore((state) => state.highlightedIds);
  const requestedRouteIds = useSceneEffectsStore((state) => state.routeIds);
  const relationshipIds = useSceneEffectsStore((state) => state.relationshipIds);
  const focusedLocationId = useSceneEffectsStore((state) => state.focusedLocationId);
  const controls = useRef<ElementRef<typeof OrbitControls>>(null);
  const point = geometry.find((item) => item.kind === 'point' && item.id === battle.geometryId);
  const battlePosition = battle.position ?? (point?.kind === 'point'
    ? [point.position[0], 0.35, point.position[2]] as [number, number, number]
    : [1.6, 0.35, -0.8]);
  const regions = geometry.filter((item): item is RuntimePolygon => item.kind === 'polygon');
  const routeGeometry = geometry.filter((item) => item.kind === 'line');
  const locations = useMemo(() => spatialStates.flatMap((state) => {
    const runtime = geometry.find((item) => item.id === state.geometryId && item.kind === 'point');
    const entity = entities.find((item) => item.id === state.entityId);
    return runtime?.kind === 'point' && entity ? [{ state, runtime, entity }] : [];
  }).sort((a, b) => (b.state.labelPriority ?? 0) - (a.state.labelPriority ?? 0)).slice(0, 80), [entities, geometry, spatialStates]);

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

      {terrainAsset ? (
        <Terrain asset={terrainAsset} />
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#171d1b" roughness={0.92} metalness={0.08} />
        </mesh>
      )}

      {layers.regions && regions.map((region) => {
        const owner = spatialStates.find((state) => state.geometryId === region.id)?.entityId;
        return <RegionMesh key={region.id} region={region} highlighted={highlightedIds.includes(region.id) || Boolean(owner && highlightedIds.includes(owner))} />;
      })}

      {layers.routes && routeGeometry.filter((route) => {
        if (requestedRouteIds.length === 0) return true;
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

      {layers.locations && locations.map(({ state, runtime, entity }) => (
        <group key={state.id} position={[runtime.position[0], 0.2, runtime.position[2]]}>
          <mesh onClick={(event) => { event.stopPropagation(); select({ kind: 'entity', id: entity.id }); }}>
            <cylinderGeometry args={[0.12, 0.18, 0.3, 6]} />
            <meshStandardMaterial color={highlightedIds.includes(entity.id) ? '#fff1c8' : '#8ba3a0'} />
          </mesh>
          {layers.labels && (
            <Html center position={[0, 0.38, 0]} distanceFactor={7}>
              <button className="map-label" type="button" onClick={() => select({ kind: 'entity', id: entity.id })}>{entity.name}</button>
            </Html>
          )}
        </group>
      ))}

      {relationshipIds.length > 0 && (
        <Html center position={[0, 0.7, 0]} distanceFactor={8}>
          <div className="story-effect-status">{relationshipIds.length} causal link{relationshipIds.length === 1 ? '' : 's'} revealed</div>
        </Html>
      )}

      {layers.battles && battleVisible && battle.geographicCertainty !== 'unknown' && (
        <group position={battlePosition}>
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
      )}

      <gridHelper args={[10, 20, '#353b35', '#1d2521']} position={[0, 0.04, 0]} />
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

  if (!supportsWebGL()) {
    return (
      <section className="map-fallback" role="status">
        <p className="eyebrow">Text-first atlas</p>
        <h2>3D map unavailable</h2>
        <p>Your browser could not start WebGL. The permanent dossiers remain fully available.</p>
        <Link to={`/battles/${props.battle.slug}`}>Open the selected battle dossier</Link>
      </section>
    );
  }

  return (
    <div className="map-viewport" aria-label="Interactive three-dimensional historical map">
      <Canvas camera={{ position: [0, 6.4, 7.2], fov: 48 }} dpr={[1, 1.75]}>
        <Suspense fallback={null}>
          <AtlasScene {...props} />
          {profile && <PerformanceProbe onReport={setPerformanceReport} />}
        </Suspense>
      </Canvas>
      <div className="map-caption" aria-hidden="true">
        PLACEHOLDER CARTOGRAPHY · DRAG TO ORBIT · SCROLL TO ZOOM
      </div>
      {profile && (
        <output className="performance-report" data-testid="performance-report">
          {performanceReport ? JSON.stringify(performanceReport) : 'Sampling renderer…'}
        </output>
      )}
    </div>
  );
}
