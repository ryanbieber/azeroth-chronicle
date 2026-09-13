import { Html, Line, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { useLayerStore } from '../../app/state/layerStore';
import { useSelectionStore } from '../../app/state/selectionStore';
import type { Battle } from '../../domain/types/lore';

interface MapViewport3DProps {
  battle: Battle;
}

function AtlasScene({ battle }: MapViewport3DProps) {
  const layers = useLayerStore((state) => state.visible);
  const select = useSelectionStore((state) => state.select);
  const selected = useSelectionStore((state) => state.selection?.id === battle.id);
  const battlePosition = battle.position ?? [1.6, 0.35, -0.8];

  return (
    <>
      <color attach="background" args={['#07090d']} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 8, 2]} intensity={2.2} color="#dfbd79" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10, 48, 48]} />
        <meshStandardMaterial color="#171d1b" roughness={0.92} metalness={0.08} />
      </mesh>

      {layers.regions && (
        <mesh position={[-0.25, 0.025, 0.2]} rotation={[-Math.PI / 2, 0, -0.18]}>
          <circleGeometry args={[2.8, 7]} />
          <meshBasicMaterial color="#4f2a45" transparent opacity={0.48} depthWrite={false} />
        </mesh>
      )}

      {layers.routes && (
        <Line
          points={[
            [-2.2, 0.12, 1.7],
            [-0.2, 0.2, 0.4],
            battlePosition,
          ]}
          color="#d4a64e"
          lineWidth={2.2}
          dashed
          dashSize={0.18}
          gapSize={0.1}
        />
      )}

      {layers.battles && (
        <group position={battlePosition}>
          <mesh
            onClick={(event) => {
              event.stopPropagation();
              select({ kind: 'battle', id: battle.id });
            }}
            scale={selected ? 1.25 : 1}
          >
            <octahedronGeometry args={[0.24]} />
            <meshStandardMaterial color={selected ? '#ffe0a0' : '#be493d'} emissive="#5b100d" />
          </mesh>
          {layers.labels && (
            <Html center position={[0, 0.52, 0]} distanceFactor={7}>
              <button className="map-label" type="button" onClick={() => select({ kind: 'battle', id: battle.id })}>
                {battle.name}
              </button>
            </Html>
          )}
        </group>
      )}

      <gridHelper args={[10, 20, '#353b35', '#1d2521']} position={[0, 0.04, 0]} />
      <OrbitControls makeDefault enableDamping minDistance={4} maxDistance={13} maxPolarAngle={Math.PI / 2.25} />
    </>
  );
}

export function MapViewport3D({ battle }: MapViewport3DProps) {
  return (
    <div className="map-viewport" aria-label="Interactive three-dimensional historical map">
      <Canvas camera={{ position: [0, 6.4, 7.2], fov: 48 }} dpr={[1, 1.75]}>
        <Suspense fallback={null}>
          <AtlasScene battle={battle} />
        </Suspense>
      </Canvas>
      <div className="map-caption" aria-hidden="true">
        PLACEHOLDER CARTOGRAPHY · DRAG TO ORBIT · SCROLL TO ZOOM
      </div>
    </div>
  );
}
