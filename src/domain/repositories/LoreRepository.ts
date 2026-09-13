import type { Battle, Era, LoreDataset, LoreEntity, LoreEvent, StoryGuide, StoryNode } from '../types/lore';
import type { GeoJsonFeatureCollection } from '../../lib/map/geometryAdapter';
import type { SearchEntry, SearchOptions } from '../../lib/search/searchIndex';

export interface LoreRepository {
  getDataset(): LoreDataset;
  listEras(): Era[];
  findEraBySlug(slug: string): Era | undefined;
  findBattleBySlug(slug: string): Battle | undefined;
  findEntityBySlug(slug: string): LoreEntity | undefined;
  findEventBySlug(slug: string): LoreEvent | undefined;
  findStoryGuide(id: string): StoryGuide | undefined;
  findStoryNode(id: string): StoryNode | undefined;
  getGeometry(id: string): GeoJsonFeatureCollection | undefined;
  listEntitiesForEra(eraId: string, sourceIds?: string[]): LoreEntity[];
  listBattlesForEra(eraId: string, sourceIds?: string[]): Battle[];
  search(query: string, options?: SearchOptions): SearchEntry[];
}
