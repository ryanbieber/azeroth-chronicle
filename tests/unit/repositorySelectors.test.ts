import { describe, expect, it } from 'vitest';
import { staticLoreRepository } from '../../src/domain/repositories/StaticLoreRepository';

describe('repository selectors', () => {
  it('applies era and source filters consistently', () => {
    expect(staticLoreRepository.listBattlesForEra('black-empire')).toHaveLength(1);
    expect(staticLoreRepository.listBattlesForEra('black-empire', ['fixture-specification-placeholder'])).toHaveLength(1);
    expect(staticLoreRepository.listBattlesForEra('black-empire', ['warcraft-chronicle-volume-1'])).toEqual([]);
    expect(staticLoreRepository.listEntitiesForEra('black-empire', ['warcraft-chronicle-volume-1'])).toEqual([]);
    expect(staticLoreRepository.search('conflict', { sourceIds: ['warcraft-chronicle-volume-1'] })).toEqual([]);
  });
});
