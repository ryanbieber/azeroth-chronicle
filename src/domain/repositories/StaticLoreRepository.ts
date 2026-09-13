import { loadDataset } from '../../lib/lore/loadDataset';
import type { LoreRepository } from './LoreRepository';

const dataset = loadDataset();

export const staticLoreRepository: LoreRepository = {
  getDataset: () => dataset,
  listEras: () => [...dataset.eras].sort((a, b) => a.order - b.order),
  findEraBySlug: (slug) => dataset.eras.find((era) => era.slug === slug),
  findBattleBySlug: (slug) => dataset.battles.find((battle) => battle.slug === slug),
  findEntityBySlug: (slug) => dataset.entities.find((entity) => entity.slug === slug),
  findStoryGuide: (id) => dataset.storyGuides.find((guide) => guide.id === id),
  findStoryNode: (id) => dataset.storyNodes.find((node) => node.id === id),
};
