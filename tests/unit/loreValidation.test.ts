import { describe, expect, it } from 'vitest';
import { loadDataset } from '../../src/lib/lore/loadDataset';
import { validateDatasetReferences } from '../../src/lib/lore/validateDataset';
import { geometryIds } from '../../src/lib/lore/loadGeometry';

describe('lore dataset', () => {
  it('parses and has no broken cross-record references', () => {
    expect(validateDatasetReferences(loadDataset(), { geometryIds: geometryIds() })).toEqual([]);
  });

  it('labels every shipped fixture as placeholder content', () => {
    const data = loadDataset();
    const records = [...data.eras, ...data.entities, ...data.events, ...data.battles, ...data.storyGuides];
    expect(records.every((record) => record.contentStatus === 'placeholder')).toBe(true);
  });

  it('can exclude placeholder and research records from a publication build', () => {
    const data = loadDataset({ publishedOnly: true });
    expect(data.eras).toEqual([]);
    expect(data.entities).toEqual([]);
    expect(data.battles).toEqual([]);
    expect(data.sources).toEqual([]);
  });

  it('detects missing published citations and unintended causal cycles', () => {
    const data = structuredClone(loadDataset());
    const battle = data.battles[0]!;
    const claim = data.claims.find((item) => item.subjectId === battle.id)!;
    battle.contentStatus = 'published';
    claim.citationIds = [];
    data.relationships.push({
      id: 'reverse-cycle-placeholder',
      fromId: 'atlas-conflict-placeholder',
      toId: 'archive-approach-placeholder',
      type: 'causes',
      citationIds: ['fixture-interaction-citation-placeholder'],
      confidence: 'explicit',
    });
    const codes = validateDatasetReferences(data, { geometryIds: geometryIds() }).map((issue) => issue.code);
    expect(codes).toContain('missing-citation');
    expect(codes).toContain('causal-cycle');
  });
});
