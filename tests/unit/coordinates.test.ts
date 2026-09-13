import { describe, expect, it } from 'vitest';
import { atlasToWorld } from '../../src/lib/map/coordinates';

describe('atlasToWorld', () => {
  it('places the center of atlas space at the Three.js origin', () => {
    expect(atlasToWorld([5000, 5000], { width: 10000, height: 10000, origin: 'bottom-left' }))
      .toEqual([0, 0, 0]);
  });

  it('honors authoring-space origin direction', () => {
    expect(atlasToWorld([0, 0], { width: 10000, height: 10000, origin: 'bottom-left' }))
      .toEqual([-5, 0, 5]);
    expect(atlasToWorld([0, 0], { width: 10000, height: 10000, origin: 'top-left' }))
      .toEqual([-5, 0, -5]);
  });
});
