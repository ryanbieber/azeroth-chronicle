import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, type ElementRef, type RefObject } from 'react';
import { Vector3 } from 'three';
import { OrbitControls } from '@react-three/drei';
import { useMapViewStore, type CameraCommand } from '../../app/state/mapViewStore';

interface AnimationState {
  command: CameraCommand;
  elapsed: number;
  startPosition: Vector3;
  startTarget: Vector3;
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function CameraRig({ controls }: { controls: RefObject<ElementRef<typeof OrbitControls> | null> }) {
  const camera = useThree((state) => state.camera);
  const command = useMapViewStore((state) => state.command);
  const settleCamera = useMapViewStore((state) => state.settleCamera);
  const animation = useRef<AnimationState | null>(null);

  useEffect(() => {
    if (!command || !controls.current) {
      animation.current = null;
      return;
    }

    if (prefersReducedMotion() || command.durationMs === 0) {
      camera.position.set(...command.position);
      controls.current.target.set(...command.target);
      controls.current.update();
      settleCamera(command);
      return;
    }

    animation.current = {
      command,
      elapsed: 0,
      startPosition: camera.position.clone(),
      startTarget: controls.current.target.clone(),
    };
  }, [camera, command, controls, settleCamera]);

  useFrame((_, delta) => {
    const current = animation.current;
    const orbit = controls.current;
    if (!current || !orbit) return;

    current.elapsed += delta * 1000;
    const duration = Math.max(1, current.command.durationMs ?? 900);
    const linear = Math.min(1, current.elapsed / duration);
    const eased = linear < 0.5 ? 4 * linear ** 3 : 1 - ((-2 * linear + 2) ** 3) / 2;
    camera.position.lerpVectors(current.startPosition, new Vector3(...current.command.position), eased);
    orbit.target.lerpVectors(current.startTarget, new Vector3(...current.command.target), eased);
    orbit.update();

    if (linear >= 1) {
      animation.current = null;
      settleCamera(current.command);
    }
  });

  return null;
}
