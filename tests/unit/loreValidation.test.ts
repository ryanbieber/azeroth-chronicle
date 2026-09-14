import { describe, expect, it } from 'vitest';
import { loadDataset } from '../../src/lib/lore/loadDataset';
import { validateDatasetReferences } from '../../src/lib/lore/validateDataset';
import { geometryIds } from '../../src/lib/lore/loadGeometry';

describe('lore dataset', () => {
  it('parses and has no broken cross-record references', () => {
    expect(validateDatasetReferences(loadDataset(), { geometryIds: geometryIds() })).toEqual([]);
  });

  it('keeps all pre-publication records explicitly labeled', () => {
    const data = loadDataset();
    const records = [
      ...data.eras,
      ...data.entities,
      ...data.events,
      ...data.battles,
      ...data.campaigns,
      ...data.routes,
      ...data.storyGuides,
    ];
    expect(records.every((record) => record.contentStatus === 'research')).toBe(true);
    expect(data.eras).toHaveLength(9);
    expect(data.eras.every((era) => era.contentStatus === 'research')).toBe(true);
  });

  it('contains the complete source-linked Era 1 research baseline', () => {
    const data = loadDataset();
    const era = data.eras.find((item) => item.id === 'black-empire')!;
    const entities = data.entities.filter((item) => item.firstEraId === era.id);
    const events = data.events.filter((item) => item.eraId === era.id);
    const battles = data.battles.filter((item) => item.eraId === era.id);
    const guide = data.storyGuides.find((item) => item.id === era.storyGuideId)!;
    const subjects = [...entities, ...events, ...battles];

    expect(entities).toHaveLength(13);
    expect(events).toHaveLength(4);
    expect(battles).toHaveLength(2);
    expect(guide.nodeIds).toHaveLength(10);
    expect(entities.filter((entity) => entity.type === 'character').every((entity) => Boolean(entity.mapFigure?.asset))).toBe(true);
    expect(['alakir', 'ragnaros', 'therazane', 'neptulon'].every((entityId) =>
      data.spatialStates.some((state) => state.entityId === entityId
        && state.eraId === era.id
        && state.geographicCertainty === 'inferred'
        && Boolean(state.geometryId)),
    )).toBe(true);
    expect(era.featuredEventIds).toEqual([
      'spirit-imbalance',
      'old-gods-arrive',
      'black-empire-rises',
      'black-empire-dominion',
    ]);
    expect(era.featuredBattleIds).toEqual([
      'elemental-wars',
      'elemental-assault-on-black-empire',
    ]);
    expect(subjects.every((subject) =>
      data.claims.some((claim) => claim.subjectId === subject.id && claim.citationIds.length > 0),
    )).toBe(true);
    expect(data.claims.every((claim) => claim.citationIds.every((citationId) =>
      data.citations.some((citation) => citation.id === citationId),
    ))).toBe(true);
  });

  it('paces each guided-history pane for slow narration', () => {
    const data = loadDataset();
    const guide = data.storyGuides.find((item) => item.id === 'black-empire-guided-history')!;
    for (const nodeId of guide.nodeIds) {
      const node = data.storyNodes.find((item) => item.id === nodeId)!;
      const words = node.narration.trim().split(/\s+/).length;
      const narrationMs = Math.round(((words / 82) * 60_000) / 500) * 500 + 5_000;
      expect(node.durationMs).toBeGreaterThanOrEqual(narrationMs);
    }
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
      id: 'reverse-cycle-research',
      fromId: 'black-empire-dominion',
      toId: 'black-empire-rises',
      type: 'causes',
      citationIds: ['warcraft-wiki-black-empire-ancient-times'],
      confidence: 'explicit',
    });
    const codes = validateDatasetReferences(data, { geometryIds: geometryIds() }).map((issue) => issue.code);
    expect(codes).toContain('missing-citation');
    expect(codes).toContain('causal-cycle');
  });

  it('rejects cross-record references to the wrong collection', () => {
    const data = structuredClone(loadDataset());
    data.entities[0]!.sourceIds = ['regions'];
    const issues = validateDatasetReferences(data, { geometryIds: geometryIds() });
    expect(issues).toContainEqual(expect.objectContaining({
      code: 'broken-reference',
      message: 'Unknown source ID: regions',
    }));
  });
});
