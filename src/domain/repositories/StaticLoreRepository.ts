import { loadDataset } from '../../lib/lore/loadDataset';
import { loadGeometry } from '../../lib/lore/loadGeometry';
import { searchLore } from '../../lib/search/searchIndex';
import { entityVisibleInEra } from '../../lib/lore/eraVisibility';
import type { LoreRepository } from './LoreRepository';
import { buildArchiveEntries } from '../../lib/lore/archiveLibrary';

const publishedOnly = import.meta.env.VITE_CONTENT_MODE === 'published';
const dataset = loadDataset({ publishedOnly });
const archiveEntries = buildArchiveEntries(dataset);

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
    entityVisibleInEra(entity, eraId, dataset.eras)
    && (sourceIds.length === 0 || entity.sourceIds.some((id) => sourceIds.includes(id)))),
  listBattlesForEra: (eraId, sourceIds = []) => dataset.battles.filter((battle) =>
    battle.eraId === eraId
    && (sourceIds.length === 0 || battle.sourceIds.some((id) => sourceIds.includes(id)))),
  listArchiveEntries: () => archiveEntries,
  search: (query, options = {}) => searchLore(query, {
    ...options,
    includeUnpublished: publishedOnly ? false : options.includeUnpublished,
  }),
};
