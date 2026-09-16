import { describe, expect, it } from 'vitest';
import { staticLoreRepository } from '../../src/domain/repositories/StaticLoreRepository';
import { buildArchiveEntries, filterArchiveEntries } from '../../src/lib/lore/archiveLibrary';

describe('archive library', () => {
  const dataset = staticLoreRepository.getDataset();
  const entries = buildArchiveEntries(dataset);

  it('automatically indexes every supported validated lore record', () => {
    const expectedIds = [
      ...dataset.mapStates.map((record) => `map:${record.id}`),
      ...dataset.entities.map((record) => `entity:${record.id}`),
      ...dataset.battles.map((record) => `battle:${record.id}`),
      ...dataset.events.map((record) => `event:${record.id}`),
    ];

    expect(entries).toHaveLength(expectedIds.length);
    expect(new Set(entries.map((entry) => entry.id))).toEqual(new Set(expectedIds));
  });

  it('exposes Aman’Thul as a character with his dedicated visual and dossiers', () => {
    expect(entries.find((entry) => entry.id === 'entity:amanthul')).toMatchObject({
      category: 'character',
      title: 'Aman’Thul',
      recordPath: '/characters/amanthul',
      atlasPath: '/map?era=cosmic-origins&selected=entity:amanthul',
      media: [{
        asset: 'images/characters/cosmic-origins/amanthul.research.webp',
      }],
    });
  });

  it('keeps contextual map art distinguishable from dedicated subject art', () => {
    const battle = entries.find((entry) => entry.recordType === 'battle');
    const map = entries.find((entry) => entry.recordType === 'mapState' && entry.media.length > 1);

    expect(battle?.media[0]).toMatchObject({ contextual: true });
    expect(map?.media.some((media) => media.label === 'Terrain height field')).toBe(true);
  });

  it('filters the generated index by category and searchable lore', () => {
    expect(filterArchiveEntries(entries, 'character', 'highfather')).toEqual([
      expect.objectContaining({ id: 'entity:amanthul' }),
    ]);
    expect(filterArchiveEntries(entries, 'map', 'aman’thul')).toHaveLength(0);
  });
});
