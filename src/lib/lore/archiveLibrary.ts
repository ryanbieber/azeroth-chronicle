import type { ArchiveCategory, ArchiveEntry, ArchiveMedia } from '../../domain/types/archive';
import type { LoreDataset, MapState } from '../../domain/types/lore';
import { entityPath } from './recordLinks';

const categoryOrder: Array<Exclude<ArchiveCategory, 'all'>> = [
  'map', 'character', 'group', 'place', 'battle', 'event', 'artifact', 'record',
];

export const archiveCategoryLabels: Record<ArchiveCategory, string> = {
  all: 'All records',
  map: 'Maps',
  character: 'Characters',
  group: 'Peoples & powers',
  place: 'Places',
  battle: 'Battles',
  event: 'Events',
  artifact: 'Artifacts',
  record: 'Other records',
};

function categoryForEntity(type: LoreDataset['entities'][number]['type']): Exclude<ArchiveCategory, 'all'> {
  if (type === 'character') return 'character';
  if (type === 'faction') return 'group';
  if (type === 'location' || type === 'site') return 'place';
  if (type === 'artifact') return 'artifact';
  return 'record';
}

function mapMedia(mapState: MapState): ArchiveMedia[] {
  const media: ArchiveMedia[] = [];
  if (mapState.terrainTextureAsset) {
    media.push({
      asset: mapState.terrainTextureAsset,
      label: mapState.presentation === 'relational' ? 'Illustrated relational field' : 'Illustrated terrain',
      kind: 'image',
      fit: 'cover',
    });
  }
  if (mapState.terrainHeightAsset) {
    media.push({
      asset: mapState.terrainHeightAsset,
      label: 'Terrain height field',
      kind: 'image',
      fit: 'cover',
    });
  }
  if (mapState.terrainAsset) {
    media.push({ asset: mapState.terrainAsset, label: 'External terrain model', kind: 'model', fit: 'contain' });
  }
  return media;
}

function eraIdsForMapState(mapStateId: string, dataset: LoreDataset): string[] {
  const guideEraById = new Map(dataset.storyGuides.map((guide) => [guide.id, guide.eraId]));
  const eraIds = new Set(dataset.eras.filter((era) => era.mapStateId === mapStateId).map((era) => era.id));
  for (const node of dataset.storyNodes) {
    if (!node.visualActions?.some((action) => action.type === 'set_map_state' && action.mapStateId === mapStateId)) continue;
    const eraId = guideEraById.get(node.guideId);
    if (eraId) eraIds.add(eraId);
  }
  return [...eraIds];
}

function contextualMapMedia(eraId: string | undefined, dataset: LoreDataset): ArchiveMedia[] {
  if (!eraId) return [];
  const era = dataset.eras.find((item) => item.id === eraId);
  const mapState = era && dataset.mapStates.find((item) => item.id === era.mapStateId);
  if (!mapState?.terrainTextureAsset) return [];
  return [{
    asset: mapState.terrainTextureAsset,
    label: 'Era terrain context — not a dedicated depiction',
    kind: 'image',
    fit: 'cover',
    contextual: true,
  }];
}

function searchText(parts: Array<string | string[] | undefined>): string {
  return parts.flatMap((part) => Array.isArray(part) ? part : [part ?? '']).join(' ').toLocaleLowerCase();
}

export function buildArchiveEntries(dataset: LoreDataset): ArchiveEntry[] {
  const eraById = new Map(dataset.eras.map((era) => [era.id, era]));
  const entries: ArchiveEntry[] = [];

  for (const mapState of dataset.mapStates) {
    const eraIds = eraIdsForMapState(mapState.id, dataset);
    const firstEra = eraIds
      .map((id) => eraById.get(id))
      .filter((era): era is LoreDataset['eras'][number] => Boolean(era))
      .sort((a, b) => a.order - b.order)[0];
    const worldspace = dataset.worldspaces.find((item) => item.id === mapState.worldspaceId);
    entries.push({
      id: `map:${mapState.id}`,
      recordId: mapState.id,
      recordType: 'mapState',
      category: 'map',
      title: mapState.name,
      subtitle: `${mapState.presentation === 'relational' ? 'Relational field' : 'Terrain state'} · ${worldspace?.name ?? mapState.worldspaceId}`,
      summary: mapState.interpretationNote ?? 'A validated atlas state in the historical archive.',
      eraIds,
      media: mapMedia(mapState),
      atlasPath: firstEra ? `/map?era=${firstEra.slug}` : undefined,
      searchText: searchText([mapState.name, mapState.cartographyLabel, mapState.interpretationNote, worldspace?.name, eraIds.map((id) => eraById.get(id)?.name ?? id)]),
    });
  }

  for (const entity of dataset.entities) {
    const eraIds = [...new Set([...(entity.featuredEraIds ?? []), entity.firstEraId].filter((id): id is string => Boolean(id)))];
    const firstEra = entity.firstEraId ? eraById.get(entity.firstEraId) : undefined;
    const dedicatedAsset = entity.mapFigure?.asset ?? entity.mapVisual?.asset;
    const media: ArchiveMedia[] = dedicatedAsset
      ? [{ asset: dedicatedAsset, label: entity.mapFigure ? 'Character interpretation' : 'Subject interpretation', kind: 'image', fit: 'contain' }]
      : contextualMapMedia(entity.firstEraId, dataset);
    entries.push({
      id: `entity:${entity.id}`,
      recordId: entity.id,
      recordType: 'entity',
      category: categoryForEntity(entity.type),
      title: entity.name,
      subtitle: entity.type === 'faction' ? 'People or power' : entity.type,
      summary: entity.shortDescription,
      eraIds,
      contentStatus: entity.contentStatus,
      media,
      recordPath: entityPath(entity),
      atlasPath: firstEra ? `/map?era=${firstEra.slug}&selected=entity:${entity.slug}` : undefined,
      searchText: searchText([entity.name, entity.aliases, entity.shortDescription, entity.tags, eraIds.map((id) => eraById.get(id)?.name ?? id)]),
    });
  }

  for (const battle of dataset.battles) {
    const era = eraById.get(battle.eraId);
    entries.push({
      id: `battle:${battle.id}`,
      recordId: battle.id,
      recordType: 'battle',
      category: 'battle',
      title: battle.name,
      subtitle: `${battle.importance.replace('_', ' ')} battle · ${era?.name ?? battle.eraId}`,
      summary: battle.summary,
      eraIds: [battle.eraId],
      contentStatus: battle.contentStatus,
      media: contextualMapMedia(battle.eraId, dataset),
      recordPath: `/battles/${battle.slug}`,
      atlasPath: `/map?era=${era?.slug ?? battle.eraId}&selected=battle:${battle.slug}`,
      searchText: searchText([battle.name, battle.summary, era?.name, battle.combatants.map((item) => item.factionId)]),
    });
  }

  for (const event of dataset.events) {
    const era = eraById.get(event.eraId);
    entries.push({
      id: `event:${event.id}`,
      recordId: event.id,
      recordType: 'event',
      category: 'event',
      title: event.name,
      subtitle: `Historical event · ${era?.name ?? event.eraId}`,
      summary: event.summary,
      eraIds: [event.eraId],
      contentStatus: event.contentStatus,
      media: contextualMapMedia(event.eraId, dataset),
      recordPath: `/events/${event.slug}`,
      atlasPath: `/map?era=${era?.slug ?? event.eraId}&selected=event:${event.slug}`,
      searchText: searchText([event.name, event.summary, event.description, era?.name]),
    });
  }

  return entries.sort((a, b) => {
    const categoryDifference = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
    return categoryDifference || a.title.localeCompare(b.title);
  });
}

export function filterArchiveEntries(entries: ArchiveEntry[], category: ArchiveCategory, query: string): ArchiveEntry[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return entries.filter((entry) =>
    (category === 'all' || entry.category === category)
    && (!normalizedQuery || entry.searchText.includes(normalizedQuery)),
  );
}
