import manifest from '../../generated/lore-manifest.json';
import { loreDatasetSchema } from '../../domain/schemas/loreSchemas';
import type { LoreDataset } from '../../domain/types/lore';

export interface LoadDatasetOptions {
  publishedOnly?: boolean;
}

export function loadDataset(options: LoadDatasetOptions = {}): LoreDataset {
  const dataset = loreDatasetSchema.parse(manifest) as LoreDataset;
  return options.publishedOnly ? filterPublishedDataset(dataset) : dataset;
}

export function filterPublishedDataset(dataset: LoreDataset): LoreDataset {
  const published = <T extends { contentStatus: string }>(records: T[]) =>
    records.filter((record) => record.contentStatus === 'published');
  const eras = published(dataset.eras);
  const entities = published(dataset.entities);
  const events = published(dataset.events);
  const battles = published(dataset.battles);
  const routes = published(dataset.routes);
  const campaigns = published(dataset.campaigns);
  const storyGuides = published(dataset.storyGuides);
  const visibleIds = new Set([
    ...eras, ...entities, ...events, ...battles, ...routes, ...campaigns, ...storyGuides,
  ].map((record) => record.id));
  const storyNodeIds = new Set(storyGuides.flatMap((guide) => guide.nodeIds));
  const storyNodes = dataset.storyNodes.filter((node) => storyNodeIds.has(node.id));
  storyNodes.forEach((node) => visibleIds.add(node.id));
  const relationships = dataset.relationships.filter((edge) =>
    visibleIds.has(edge.fromId) && visibleIds.has(edge.toId));
  const claims = dataset.claims.filter((claim) => visibleIds.has(claim.subjectId));
  const citationIds = new Set([
    ...relationships.flatMap((edge) => edge.citationIds),
    ...claims.flatMap((claim) => claim.citationIds),
  ]);
  const citations = dataset.citations.filter((citation) => citationIds.has(citation.id));
  const directlyReferencedSourceIds = [
    ...eras, ...entities, ...events, ...battles, ...routes, ...campaigns,
  ].flatMap((record) => record.sourceIds);
  const sourceIds = new Set([...directlyReferencedSourceIds, ...citations.map((citation) => citation.sourceId)]);
  const mapStateIds = new Set([
    ...eras.map((era) => era.mapStateId),
    ...storyNodes.flatMap((node) => (node.visualActions ?? []).flatMap((action) =>
      action.type === 'set_map_state' ? [action.mapStateId] : [])),
  ]);
  const worldspaceIds = new Set(dataset.mapStates
    .filter((item) => mapStateIds.has(item.id))
    .map((item) => item.worldspaceId));
  const layerIds = new Set(eras.flatMap((era) => era.defaultLayerIds));

  return {
    worldspaces: dataset.worldspaces.filter((item) => worldspaceIds.has(item.id)),
    mapStates: dataset.mapStates.filter((item) => mapStateIds.has(item.id)),
    spatialStates: dataset.spatialStates.filter((state) =>
      visibleIds.has(state.entityId) && visibleIds.has(state.eraId)),
    layers: dataset.layers.filter((layer) => layerIds.has(layer.id)),
    routes,
    campaigns,
    eras,
    entities,
    events,
    battles,
    sources: dataset.sources.filter((source) => sourceIds.has(source.id)),
    citations,
    claims,
    relationships,
    storyGuides,
    storyNodes,
  };
}
