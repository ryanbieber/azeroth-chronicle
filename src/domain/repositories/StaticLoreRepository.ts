import { loadDataset } from '../../lib/lore/loadDataset';
import { loadGeometry } from '../../lib/lore/loadGeometry';
import { searchLore } from '../../lib/search/searchIndex';
import type { LoreRepository } from './LoreRepository';

const dataset = loadDataset({ publishedOnly: import.meta.env.VITE_CONTENT_MODE === 'published' });

export const staticLoreRepository: LoreRepository = {
  getDataset: () => dataset,
  listEras: () => [...dataset.eras].sort((a, b) => a.order - b.order),
  findEraBySlug: (slug) => dataset.eras.find((era) => era.slug === slug),
  findBattleBySlug: (slug) => dataset.battles.find((battle) => battle.slug === slug),
  findEntityBySlug: (slug) => dataset.entities.find((entity) => entity.slug === slug),
  findEventBySlug: (slug) => dataset.events.find((event) => event.slug === slug),
  findStoryGuide: (id) => dataset.storyGuides.find((guide) => guide.id === id),
  findStoryNode: (id) => dataset.storyNodes.find((node) => node.id === id),
  getGeometry: loadGeometry,
  listEntitiesForEra: (eraId, sourceIds = []) => dataset.entities.filter((entity) =>
    (!entity.firstEraId || entity.firstEraId === eraId)
    && (sourceIds.length === 0 || entity.sourceIds.some((id) => sourceIds.includes(id)))),
  listBattlesForEra: (eraId, sourceIds = []) => dataset.battles.filter((battle) =>
    battle.eraId === eraId
    && (sourceIds.length === 0 || battle.sourceIds.some((id) => sourceIds.includes(id)))),
  search: searchLore,
};
