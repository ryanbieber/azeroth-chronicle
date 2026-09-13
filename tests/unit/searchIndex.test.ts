import { describe, expect, it } from 'vitest';
import { searchLore } from '../../src/lib/search/searchIndex';

describe('search index', () => {
  it('weights exact name matches and supports era/source publication filters', () => {
    expect(searchLore('atlas conflict')[0]?.id).toBe('atlas-conflict-placeholder');
    expect(searchLore('atlas', { eraId: 'missing-era' })).toEqual([]);
    expect(searchLore('atlas', { sourceIds: ['missing-source'] })).toEqual([]);
    expect(searchLore('atlas', { includeUnpublished: false })).toEqual([]);
  });
});
