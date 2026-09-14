import { atlasToWorld, type AtlasCoordinateSystem } from './coordinates';
import { z } from 'zod';

export type AtlasPosition = readonly [number, number];

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  name?: string;
  features: GeoJsonFeature[];
}

export interface GeoJsonFeature {
  type: 'Feature';
  id: string;
  properties: Record<string, unknown>;
  geometry:
    | { type: 'Polygon'; coordinates: AtlasPosition[][] }
    | { type: 'LineString'; coordinates: AtlasPosition[] }
    | { type: 'Point'; coordinates: AtlasPosition };
}

export interface RuntimePolygon {
  id: string;
  name: string;
  kind: 'polygon';
  rings: Array<Array<[number, number, number]>>;
  styleRole: 'landmass' | 'influence' | 'region';
  geographicCertainty?: 'exact' | 'approximate' | 'inferred' | 'unknown';
}

export interface RuntimeLine {
  id: string;
  name: string;
  kind: 'line';
  points: Array<[number, number, number]>;
}

export interface RuntimePoint {
  id: string;
  name: string;
  kind: 'point';
  position: [number, number, number];
}

export type RuntimeGeometry = RuntimePolygon | RuntimeLine | RuntimePoint;

export interface GeometryIssue {
  featureId: string;
  message: string;
}

const atlasPositionSchema = z.tuple([z.number(), z.number()]);

export const geoJsonFeatureCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  name: z.string().optional(),
  features: z.array(z.object({
    type: z.literal('Feature'),
    id: z.string().min(1),
    properties: z.record(z.string(), z.unknown()),
    geometry: z.discriminatedUnion('type', [
      z.object({ type: z.literal('Polygon'), coordinates: z.array(z.array(atlasPositionSchema)) }),
      z.object({ type: z.literal('LineString'), coordinates: z.array(atlasPositionSchema) }),
      z.object({ type: z.literal('Point'), coordinates: atlasPositionSchema }),
    ]),
  })),
});

function featureName(feature: GeoJsonFeature): string {
  return typeof feature.properties.name === 'string' ? feature.properties.name : feature.id;
}

function polygonStyleRole(feature: GeoJsonFeature): RuntimePolygon['styleRole'] {
  return feature.properties.styleRole === 'landmass' || feature.properties.styleRole === 'influence'
    ? feature.properties.styleRole
    : 'region';
}

function featureCertainty(feature: GeoJsonFeature): RuntimePolygon['geographicCertainty'] {
  const value = feature.properties.geographicCertainty;
  return value === 'exact' || value === 'approximate' || value === 'inferred' || value === 'unknown'
    ? value
    : undefined;
}

function coordinateInBounds(position: AtlasPosition, system: AtlasCoordinateSystem): boolean {
  return Number.isFinite(position[0])
    && Number.isFinite(position[1])
    && position[0] >= 0
    && position[0] <= system.width
    && position[1] >= 0
    && position[1] <= system.height;
}

export function validateGeometry(
  collection: GeoJsonFeatureCollection,
  system: AtlasCoordinateSystem,
): GeometryIssue[] {
  const issues: GeometryIssue[] = [];
  const ids = new Set<string>();

  for (const feature of collection.features) {
    if (ids.has(feature.id)) {
      issues.push({ featureId: feature.id, message: `Duplicate feature ID: ${feature.id}` });
    }
    ids.add(feature.id);

    const coordinates = feature.geometry.type === 'Polygon'
      ? feature.geometry.coordinates.flat()
      : feature.geometry.type === 'Point'
        ? [feature.geometry.coordinates]
        : feature.geometry.coordinates;

    for (const coordinate of coordinates) {
      if (!coordinateInBounds(coordinate, system)) {
        issues.push({
          featureId: feature.id,
          message: `Coordinate ${coordinate.join(',')} is outside 0..${system.width} × 0..${system.height}`,
        });
      }
    }

    if (feature.geometry.type === 'Polygon') {
      for (const ring of feature.geometry.coordinates) {
        if (ring.length < 4) {
          issues.push({ featureId: feature.id, message: 'Polygon rings require at least four positions.' });
        } else {
          const first = ring[0];
          const last = ring[ring.length - 1];
          if (first?.[0] !== last?.[0] || first?.[1] !== last?.[1]) {
            issues.push({ featureId: feature.id, message: 'Polygon rings must be closed.' });
          }
        }
      }
    }
  }

  return issues;
}

export function adaptGeometry(
  collection: GeoJsonFeatureCollection,
  system: AtlasCoordinateSystem,
  worldSize = 10,
  worldDepth = worldSize,
): RuntimeGeometry[] {
  const issues = validateGeometry(collection, system);
  if (issues.length > 0) {
    throw new Error(issues.map((issue) => `${issue.featureId}: ${issue.message}`).join('\n'));
  }

  return collection.features.map((feature): RuntimeGeometry => {
    const name = featureName(feature);
    switch (feature.geometry.type) {
      case 'Polygon':
        return {
          id: feature.id,
          name,
          kind: 'polygon',
          styleRole: polygonStyleRole(feature),
          geographicCertainty: featureCertainty(feature),
          rings: feature.geometry.coordinates.map((ring) =>
            ring.map((coordinate) => atlasToWorld(coordinate, system, worldSize, worldDepth))),
        };
      case 'LineString':
        return {
          id: feature.id,
          name,
          kind: 'line',
          points: feature.geometry.coordinates.map((coordinate) => atlasToWorld(coordinate, system, worldSize, worldDepth)),
        };
      case 'Point':
        return {
          id: feature.id,
          name,
          kind: 'point',
          position: atlasToWorld(feature.geometry.coordinates, system, worldSize, worldDepth),
        };
    }
  });
}
