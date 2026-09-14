import geometryManifest from '../../generated/geometry-manifest.json';
import { geoJsonFeatureCollectionSchema, type GeoJsonFeatureCollection } from '../map/geometryAdapter';

const collections = geoJsonFeatureCollectionSchema.array().parse(geometryManifest) as GeoJsonFeatureCollection[];
const geometryById = new Map<string, GeoJsonFeatureCollection>();
for (const collection of collections) {
  for (const feature of collection.features) geometryById.set(feature.id, collection);
}

export function loadGeometry(id: string): GeoJsonFeatureCollection | undefined {
  return geometryById.get(id);
}

export function listGeometryCollections(): GeoJsonFeatureCollection[] {
  return collections;
}

export function geometryIds(): ReadonlySet<string> {
  return new Set(listGeometryCollections().flatMap((collection) => collection.features.map((feature) => feature.id)));
}
