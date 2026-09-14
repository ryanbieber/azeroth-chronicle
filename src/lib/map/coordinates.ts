export interface AtlasCoordinateSystem {
  width: number;
  height: number;
  origin: 'top-left' | 'bottom-left';
}

/** Converts authoring-space atlas coordinates to an X/Z-centered Three.js plane. */
export function atlasToWorld(
  coordinate: readonly [number, number],
  system: AtlasCoordinateSystem,
  worldSize = 10,
  worldDepth = worldSize,
): [number, number, number] {
  const normalizedX = coordinate[0] / system.width;
  const normalizedY = coordinate[1] / system.height;
  const x = (normalizedX - 0.5) * worldSize;
  const zValue = system.origin === 'top-left' ? normalizedY : 1 - normalizedY;
  const z = (zValue - 0.5) * worldDepth;
  return [x, 0, z];
}
