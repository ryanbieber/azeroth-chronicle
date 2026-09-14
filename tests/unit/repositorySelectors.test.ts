import { describe, expect, it } from 'vitest';
import { staticLoreRepository } from '../../src/domain/repositories/StaticLoreRepository';

describe('repository selectors', () => {
  it('applies era and source filters consistently', () => {
    expect(staticLoreRepository.listBattlesForEra('black-empire')).toHaveLength(2);
    expect(staticLoreRepository.listBattlesForEra('black-empire', ['warcraft-chronicle-volume-1'])).toHaveLength(2);
    expect(staticLoreRepository.listBattlesForEra('black-empire', ['warcraft-wiki-chronicle-volume-1'])).toHaveLength(1);
    expect(staticLoreRepository.listEntitiesForEra('black-empire', ['warcraft-chronicle-volume-1'])).toHaveLength(13);
    expect(staticLoreRepository.search('elemental', { sourceIds: ['warcraft-chronicle-volume-1'] }).length).toBeGreaterThan(0);
  });
});
