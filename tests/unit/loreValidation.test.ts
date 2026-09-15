import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadDataset } from '../../src/lib/lore/loadDataset';
import { validateDatasetReferences } from '../../src/lib/lore/validateDataset';
import { geometryIds } from '../../src/lib/lore/loadGeometry';
import { entityVisibleInEra } from '../../src/lib/lore/eraVisibility';
import { mapStateSchema, spatialStateSchema } from '../../src/domain/schemas/loreSchemas';

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
    expect(data.eras).toHaveLength(10);
    expect(data.eras.every((era) => era.contentStatus === 'research')).toBe(true);
  });

  it('contains the complete source-linked Era 1 research baseline', () => {
    const data = loadDataset();
    const era = data.eras.find((item) => item.id === 'black-empire')!;
    const entities = data.entities.filter((item) => entityVisibleInEra(item, era.id, data.eras));
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

  it('contains a complete source-linked Cosmic Origins research slice', () => {
    const data = loadDataset();
    const era = data.eras.find((item) => item.id === 'cosmic-origins')!;
    const mapState = data.mapStates.find((item) => item.id === era.mapStateId)!;
    const entities = data.entities.filter((item) => entityVisibleInEra(item, era.id, data.eras));
    const events = data.events.filter((item) => item.eraId === era.id);
    const guide = data.storyGuides.find((item) => item.id === era.storyGuideId)!;
    const spatialStates = data.spatialStates.filter((item) => item.eraId === era.id);

    expect(era.order).toBe(0);
    expect(era.nextEraId).toBe('black-empire');
    expect(mapState.presentation).toBe('relational');
    expect(mapState.terrainTextureAsset).toBeTruthy();
    expect(mapState.terrainHeightAsset).toBeUndefined();
    expect(mapState.interpretationNote).toMatch(/not canonical cosmic geography/i);
    expect(entities).toHaveLength(10);
    expect(events).toHaveLength(4);
    expect(era.featuredBattleIds).toEqual([]);
    expect(guide.nodeIds).toHaveLength(9);
    expect(entities.filter((entity) => entity.type === 'character').every((entity) => Boolean(entity.mapFigure?.asset))).toBe(true);
    const keyActorIds = ['amanthul', 'pantheon-of-order', 'void-lords', 'old-gods'];
    expect(keyActorIds.every((entityId) => {
      const entity = entities.find((item) => item.id === entityId);
      return Boolean(entity?.mapFigure?.asset ?? entity?.mapVisual?.asset);
    })).toBe(true);
    expect(keyActorIds.every((entityId) => {
      const entity = entities.find((item) => item.id === entityId);
      const asset = entity?.mapFigure?.asset ?? entity?.mapVisual?.asset;
      return Boolean(asset && existsSync(resolve('public', asset)));
    })).toBe(true);
    expect(spatialStates).toHaveLength(10);
    expect(spatialStates.every((state) => state.placementKind === 'relational'
      && state.geographicCertainty === 'unknown'
      && Boolean(state.geometryId)
      && Boolean(state.editorNote))).toBe(true);
    expect([...entities, ...events].every((subject) =>
      data.claims.some((claim) => claim.subjectId === subject.id && claim.citationIds.length > 0),
    )).toBe(true);
    expect(data.eras.find((item) => item.id === 'black-empire')?.previousEraId).toBe(era.id);
    expect(data.relationships).toContainEqual(expect.objectContaining({
      id: 'old-gods-scattered-precedes-azeroth-arrival',
      type: 'precedes',
    }));
  });

  it('contains a complete source-linked Ordering of Azeroth research slice', () => {
    const data = loadDataset();
    const era = data.eras.find((item) => item.id === 'ordering-of-azeroth')!;
    const mapState = data.mapStates.find((item) => item.id === era.mapStateId)!;
    const blackEmpireMapState = data.mapStates.find((item) => item.id === 'black-empire-map-research')!;
    const entities = data.entities.filter((item) => entityVisibleInEra(item, era.id, data.eras));
    const events = data.events.filter((item) => item.eraId === era.id);
    const battles = data.battles.filter((item) => item.eraId === era.id);
    const guide = data.storyGuides.find((item) => item.id === era.storyGuideId)!;
    const nodes = guide.nodeIds.map((nodeId) => data.storyNodes.find((item) => item.id === nodeId)!);
    const spatialStates = data.spatialStates.filter((item) => item.eraId === era.id);

    expect(era.order).toBe(2);
    expect(era.previousEraId).toBe('black-empire');
    expect(era.nextEraId).toBe('ancient-civilizations');
    expect(entities).toHaveLength(20);
    expect(events).toHaveLength(8);
    expect(battles).toHaveLength(1);
    expect(guide.nodeIds).toHaveLength(11);
    expect(spatialStates).toHaveLength(12);
    expect(mapState.presentation).toBe('terrain');
    expect(mapState.terrainTextureAsset).toBeTruthy();
    expect(mapState.terrainHeightAsset).toBeTruthy();
    expect(mapState.terrainTextureAsset).not.toBe(blackEmpireMapState.terrainTextureAsset);
    expect(mapState.interpretationNote).toMatch(/preserves the Era 1 research coastline/i);
    expect(battles[0]).toMatchObject({
      geographicCertainty: 'unknown',
      campaignId: 'titan-forged-ordering-campaign',
    });
    expect(battles[0]?.geometryId).toBeUndefined();
    expect(data.routes.filter((route) => data.campaigns.some((campaign) =>
      campaign.eraId === era.id && campaign.routeIds?.includes(route.id),
    ))).toEqual([]);

    const keyActorIds = [
      'aggramar', 'amanthul', 'pantheon-of-order', 'titan-forged', 'keepers',
      'old-gods', 'yshaarj', 'alakir', 'ragnaros', 'therazane', 'neptulon',
    ];
    expect(keyActorIds.every((entityId) => {
      const entity = entities.find((item) => item.id === entityId);
      const asset = entity?.mapFigure?.asset ?? entity?.mapVisual?.asset;
      return Boolean(asset && existsSync(resolve('public', asset)));
    })).toBe(true);
    expect(['aggramar', 'amanthul', 'yshaarj-central-bastion'].every((entityId) =>
      spatialStates.some((state) => state.entityId === entityId && state.visualPresence === 'contextual'),
    )).toBe(true);
    expect(spatialStates.filter((state) => state.placementKind === 'relational').every((state) =>
      state.geographicCertainty === 'unknown' && Boolean(state.editorNote),
    )).toBe(true);
    expect([...entities, ...events, ...battles].every((subject) =>
      data.claims.some((claim) => claim.subjectId === subject.id && claim.citationIds.length > 0),
    )).toBe(true);
    expect(nodes.slice(0, 6).every((node) => node.visualActions?.some((action) =>
      action.type === 'set_map_state' && action.mapStateId === 'black-empire-map-research'))).toBe(true);
    expect(nodes.slice(6).every((node) => node.visualActions?.some((action) =>
      action.type === 'set_map_state' && action.mapStateId === 'ordering-of-azeroth-map-research'))).toBe(true);
    expect(data.relationships).toContainEqual(expect.objectContaining({
      id: 'ordering-precedes-ancient-civilizations',
      type: 'precedes',
    }));
  });

  it('enforces the non-geographic relational visualization contract', () => {
    expect(mapStateSchema.safeParse({
      id: 'relational-test',
      name: 'Relational test',
      worldspaceId: 'cosmos',
      presentation: 'relational',
      terrainTextureAsset: 'field.png',
      terrainHeightAsset: 'height.png',
      interpretationNote: 'Diagram only.',
      geometryIds: [],
    }).success).toBe(false);
    expect(spatialStateSchema.safeParse({
      id: 'relational-placement-test',
      entityId: 'subject',
      eraId: 'cosmic-origins',
      worldspaceId: 'cosmos',
      geometryId: 'subject-point',
      placementKind: 'relational',
      geographicCertainty: 'unknown',
      sourceIds: [],
    }).success).toBe(false);
    expect(spatialStateSchema.safeParse({
      id: 'relational-geography-test',
      entityId: 'subject',
      eraId: 'cosmic-origins',
      worldspaceId: 'cosmos',
      geometryId: 'subject-point',
      placementKind: 'relational',
      geographicCertainty: 'exact',
      sourceIds: [],
      editorNote: 'Diagram only.',
    }).success).toBe(false);
  });

  it('paces each guided-history pane for slow narration', () => {
    const data = loadDataset();
    for (const guideId of ['black-empire-guided-history', 'cosmic-origins-guided-history', 'ordering-of-azeroth-guided-history']) {
      const guide = data.storyGuides.find((item) => item.id === guideId)!;
      for (const nodeId of guide.nodeIds) {
        const node = data.storyNodes.find((item) => item.id === nodeId)!;
        const words = node.narration.trim().split(/\s+/).length;
        const narrationMs = Math.round(((words / 82) * 60_000) / 500) * 500 + 5_000;
        expect(node.durationMs).toBeGreaterThanOrEqual(narrationMs);
      }
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
