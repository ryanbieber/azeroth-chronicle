import { describe, expect, it } from 'vitest';
import { loadDataset } from '../../src/lib/lore/loadDataset';
import { validateDatasetReferences } from '../../src/lib/lore/validateDataset';

describe('lore dataset', () => {
  it('parses and has no broken cross-record references', () => {
    expect(validateDatasetReferences(loadDataset())).toEqual([]);
  });

  it('labels every shipped fixture as placeholder content', () => {
    const data = loadDataset();
    const records = [...data.eras, ...data.entities, ...data.events, ...data.battles, ...data.storyGuides];
    expect(records.every((record) => record.contentStatus === 'placeholder')).toBe(true);
  });
});
