import type { Era, LoreDataset, MapState } from '../../domain/types/lore';

export function mapStateIdsForEra(dataset: LoreDataset, era: Era): Set<string> {
  const ids = new Set<string>([era.mapStateId]);
  if (!era.storyGuideId) return ids;

  const guide = dataset.storyGuides.find((item) => item.id === era.storyGuideId);
  if (!guide) return ids;

  for (const node of dataset.storyNodes) {
    if (!guide.nodeIds.includes(node.id)) continue;
    for (const action of node.visualActions ?? []) {
      if (action.type === 'set_map_state') ids.add(action.mapStateId);
    }
  }
  return ids;
}

export function resolveEraMapState(
  dataset: LoreDataset,
  era: Era,
  requestedMapStateId: string | null,
): MapState | undefined {
  const permittedIds = mapStateIdsForEra(dataset, era);
  const requested = requestedMapStateId && permittedIds.has(requestedMapStateId)
    ? dataset.mapStates.find((item) => item.id === requestedMapStateId)
    : undefined;
  return requested ?? dataset.mapStates.find((item) => item.id === era.mapStateId);
}
