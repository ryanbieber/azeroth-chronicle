import type { Battle, Era, LoreDataset, LoreEntity, StoryGuide, StoryNode } from '../types/lore';

export interface LoreRepository {
  getDataset(): LoreDataset;
  listEras(): Era[];
  findEraBySlug(slug: string): Era | undefined;
  findBattleBySlug(slug: string): Battle | undefined;
  findEntityBySlug(slug: string): LoreEntity | undefined;
  findStoryGuide(id: string): StoryGuide | undefined;
  findStoryNode(id: string): StoryNode | undefined;
}
