import { describe, expect, it } from 'vitest';
import { searchLore } from '../../src/lib/search/searchIndex';

describe('search index', () => {
  it('weights exact name matches and supports era/source publication filters', () => {
    expect(searchLore('arrival of the old gods')[0]?.id).toBe('old-gods-arrive');
    expect(searchLore('alakir', { eraId: 'missing-era' })).toEqual([]);
    expect(searchLore('alakir', { sourceIds: ['missing-source'] })).toEqual([]);
    expect(searchLore('alakir', { includeUnpublished: false })).toEqual([]);
  });
});
