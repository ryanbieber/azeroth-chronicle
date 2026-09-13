import type { LayerId } from '../../app/state/layerStore';
import type { Selection } from '../../app/state/selectionStore';
import type { LoreDataset } from '../../domain/types/lore';

export const layerIds: LayerId[] = ['regions', 'battles', 'locations', 'routes', 'labels'];

export interface AtlasUrlState {
  eraId: string | null;
  selection: Selection;
  layers: Record<LayerId, boolean>;
}

function findSelection(kind: string, slug: string, dataset: LoreDataset): Selection {
  if (kind === 'battle') {
    const record = dataset.battles.find((item) => item.slug === slug);
    return record ? { kind: 'battle', id: record.id } : null;
  }
  if (kind === 'event') {
    const record = dataset.events.find((item) => item.slug === slug);
    return record ? { kind: 'event', id: record.id } : null;
  }
  if (kind === 'entity') {
    const record = dataset.entities.find((item) => item.slug === slug);
    return record ? { kind: 'entity', id: record.id } : null;
  }
  return null;
}

export function parseAtlasUrl(params: URLSearchParams, dataset: LoreDataset): AtlasUrlState {
  const era = dataset.eras.find((item) => item.slug === params.get('era')) ?? dataset.eras[0];
  const selected = params.get('selected')?.split(':', 2);
  const legacyBattle = params.get('battle');
  const selection = selected?.[0] && selected[1]
    ? findSelection(selected[0], selected[1], dataset)
    : legacyBattle
      ? findSelection('battle', legacyBattle, dataset)
      : null;
  const layerParam = params.get('layers');
  const enabled = new Set(layerParam?.split(',').filter(Boolean) ?? layerIds);

  return {
    eraId: era?.id ?? null,
    selection,
    layers: Object.fromEntries(layerIds.map((id) => [id, enabled.has(id)])) as Record<LayerId, boolean>,
  };
}

function selectionSlug(selection: Exclude<Selection, null>, dataset: LoreDataset): string | undefined {
  if (selection.kind === 'battle') return dataset.battles.find((item) => item.id === selection.id)?.slug;
  if (selection.kind === 'event') return dataset.events.find((item) => item.id === selection.id)?.slug;
  return dataset.entities.find((item) => item.id === selection.id)?.slug;
}

export function serializeAtlasUrl(state: AtlasUrlState, dataset: LoreDataset): URLSearchParams {
  const params = new URLSearchParams();
  const era = dataset.eras.find((item) => item.id === state.eraId);
  if (era) params.set('era', era.slug);
  if (state.selection) {
    const slug = selectionSlug(state.selection, dataset);
    if (slug) params.set('selected', `${state.selection.kind}:${slug}`);
  }
  const visible = layerIds.filter((id) => state.layers[id]);
  if (visible.length !== layerIds.length) params.set('layers', visible.join(','));
  return params;
}
