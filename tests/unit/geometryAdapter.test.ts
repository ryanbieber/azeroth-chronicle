import { describe, expect, it } from 'vitest';
import { adaptGeometry, validateGeometry, type GeoJsonFeatureCollection } from '../../src/lib/map/geometryAdapter';

const system = { width: 10000, height: 10000, origin: 'bottom-left' as const };

const fixture: GeoJsonFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'region-example',
      properties: { name: 'Example region' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [10000, 0], [10000, 10000], [0, 0]]],
      },
    },
    {
      type: 'Feature',
      id: 'route-example',
      properties: { name: 'Example route' },
      geometry: { type: 'LineString', coordinates: [[0, 0], [5000, 5000]] },
    },
  ],
};

describe('geometry adapter', () => {
  it('converts Polygon rings and LineString points to centered world coordinates', () => {
    const [polygon, route] = adaptGeometry(fixture, system);
    expect(polygon).toMatchObject({ kind: 'polygon', id: 'region-example' });
    expect(polygon?.kind === 'polygon' && polygon.rings[0]?.[0]).toEqual([-5, 0, 5]);
    expect(route).toMatchObject({ kind: 'line', id: 'route-example' });
    expect(route?.kind === 'line' && route.points[1]).toEqual([0, 0, 0]);
  });

  it('reports out-of-bounds coordinates and malformed polygon rings', () => {
    const invalid: GeoJsonFeatureCollection = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        id: 'invalid-region',
        properties: {},
        geometry: { type: 'Polygon', coordinates: [[[0, 0], [12000, 0], [0, 0]]] },
      }],
    };
    expect(validateGeometry(invalid, system).map((issue) => issue.message)).toEqual([
      'Coordinate 12000,0 is outside 0..10000 × 0..10000',
      'Polygon rings require at least four positions.',
    ]);
  });
});
