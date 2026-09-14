import type { LoreDataset, VisualAction } from '../../domain/types/lore';

export interface ValidationIssue {
  code: 'duplicate-id' | 'duplicate-slug' | 'broken-reference' | 'missing-citation' | 'causal-cycle';
  path: string;
  message: string;
}

export interface ValidationContext {
  geometryIds?: ReadonlySet<string>;
}

export function validateDatasetReferences(
  dataset: LoreDataset,
  context: ValidationContext = {},
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const collections = [
    dataset.worldspaces,
    dataset.mapStates,
    dataset.spatialStates,
    dataset.layers,
    dataset.routes,
    dataset.campaigns,
    dataset.eras,
    dataset.entities,
    dataset.events,
    dataset.battles,
    dataset.sources,
    dataset.citations,
    dataset.claims,
    dataset.relationships,
    dataset.storyGuides,
    dataset.storyNodes,
  ];
  const ids = new Set<string>();

  for (const collection of collections) {
    for (const record of collection) {
      if (ids.has(record.id)) {
        issues.push({ code: 'duplicate-id', path: record.id, message: `Duplicate ID: ${record.id}` });
      }
      ids.add(record.id);
    }
  }

  const idSet = <T extends { id: string }>(records: T[]) => new Set(records.map((record) => record.id));
  const worldspaceIds = idSet(dataset.worldspaces);
  const mapStateIds = idSet(dataset.mapStates);
  const layerIds = idSet(dataset.layers);
  const routeIds = idSet(dataset.routes);
  const campaignIds = idSet(dataset.campaigns);
  const eraIds = idSet(dataset.eras);
  const entityIds = idSet(dataset.entities);
  const factionIds = new Set(dataset.entities.filter((entity) => entity.type === 'faction').map((entity) => entity.id));
  const locationIds = new Set(dataset.entities.filter((entity) => entity.type === 'location' || entity.type === 'site').map((entity) => entity.id));
  const eventIds = idSet(dataset.events);
  const battleIds = idSet(dataset.battles);
  const historicalEventIds = new Set([...eventIds, ...battleIds]);
  const sourceIds = idSet(dataset.sources);
  const citationIds = idSet(dataset.citations);
  const claimIds = idSet(dataset.claims);
  const relationshipIds = idSet(dataset.relationships);
  const guideIds = idSet(dataset.storyGuides);
  const nodeIds = idSet(dataset.storyNodes);
  const subjectIds = new Set([...eraIds, ...entityIds, ...eventIds, ...battleIds, ...campaignIds]);

  const slugs = new Set<string>();
  for (const record of [
    ...dataset.worldspaces,
    ...dataset.eras,
    ...dataset.campaigns,
    ...dataset.entities,
    ...dataset.events,
    ...dataset.battles,
  ]) {
    if (slugs.has(record.slug)) {
      issues.push({ code: 'duplicate-slug', path: record.id, message: `Duplicate slug: ${record.slug}` });
    }
    slugs.add(record.slug);
  }

  const requireFrom = (value: string | undefined, validIds: ReadonlySet<string>, path: string, kind: string) => {
    if (value && !validIds.has(value)) {
      issues.push({ code: 'broken-reference', path, message: `Unknown ${kind} ID: ${value}` });
    }
  };
  const requireAllFrom = (values: string[] | undefined, validIds: ReadonlySet<string>, path: string, kind: string) =>
    values?.forEach((value) => requireFrom(value, validIds, path, kind));
  const requireGeometry = (value: string | undefined, path: string) => {
    if (value && context.geometryIds && !context.geometryIds.has(value)) {
      issues.push({ code: 'broken-reference', path, message: `Unknown geometry ID: ${value}` });
    }
  };
  const requireSources = (values: string[], path: string) => requireAllFrom(values, sourceIds, path, 'source');

  for (const map of dataset.mapStates) {
    requireFrom(map.worldspaceId, worldspaceIds, `mapStates.${map.id}.worldspaceId`, 'worldspace');
    map.geometryIds.forEach((value) => requireGeometry(value, `mapStates.${map.id}.geometryIds`));
  }
  for (const state of dataset.spatialStates) {
    requireFrom(state.entityId, entityIds, `spatialStates.${state.id}.entityId`, 'entity');
    requireFrom(state.eraId, eraIds, `spatialStates.${state.id}.eraId`, 'era');
    requireFrom(state.worldspaceId, worldspaceIds, `spatialStates.${state.id}.worldspaceId`, 'worldspace');
    requireGeometry(state.geometryId, `spatialStates.${state.id}.geometryId`);
    requireSources(state.sourceIds, `spatialStates.${state.id}.sourceIds`);
  }
  for (const route of dataset.routes) {
    requireFrom(route.worldspaceId, worldspaceIds, `routes.${route.id}.worldspaceId`, 'worldspace');
    requireGeometry(route.geometryId, `routes.${route.id}.geometryId`);
    requireSources(route.sourceIds, `routes.${route.id}.sourceIds`);
  }
  for (const campaign of dataset.campaigns) {
    requireFrom(campaign.eraId, eraIds, `campaigns.${campaign.id}.eraId`, 'era');
    requireAllFrom(campaign.battleIds, battleIds, `campaigns.${campaign.id}.battleIds`, 'battle');
    requireAllFrom(campaign.routeIds, routeIds, `campaigns.${campaign.id}.routeIds`, 'route');
    requireSources(campaign.sourceIds, `campaigns.${campaign.id}.sourceIds`);
  }
  for (const era of dataset.eras) {
    requireFrom(era.worldspaceId, worldspaceIds, `eras.${era.id}.worldspaceId`, 'worldspace');
    requireFrom(era.mapStateId, mapStateIds, `eras.${era.id}.mapStateId`, 'map state');
    requireFrom(era.storyGuideId, guideIds, `eras.${era.id}.storyGuideId`, 'story guide');
    requireFrom(era.previousEraId, eraIds, `eras.${era.id}.previousEraId`, 'era');
    requireFrom(era.nextEraId, eraIds, `eras.${era.id}.nextEraId`, 'era');
    requireAllFrom(era.defaultLayerIds, layerIds, `eras.${era.id}.defaultLayerIds`, 'layer');
    requireAllFrom(era.featuredEventIds, eventIds, `eras.${era.id}.featuredEventIds`, 'event');
    requireAllFrom(era.featuredBattleIds, battleIds, `eras.${era.id}.featuredBattleIds`, 'battle');
    requireSources(era.sourceIds, `eras.${era.id}.sourceIds`);
  }
  for (const entity of dataset.entities) {
    requireFrom(entity.firstEraId, eraIds, `entities.${entity.id}.firstEraId`, 'era');
    requireFrom(entity.lastEraId, eraIds, `entities.${entity.id}.lastEraId`, 'era');
    requireAllFrom(entity.featuredEraIds, eraIds, `entities.${entity.id}.featuredEraIds`, 'era');
    requireSources(entity.sourceIds, `entities.${entity.id}.sourceIds`);
    requireAllFrom(entity.claimIds, claimIds, `entities.${entity.id}.claimIds`, 'claim');
    requireFrom(entity.mapFigure?.anchorEntityId, entityIds, `entities.${entity.id}.mapFigure.anchorEntityId`, 'entity');
  }

  const validateEvent = (event: LoreDataset['events'][number] | LoreDataset['battles'][number], prefix: string) => {
    requireFrom(event.eraId, eraIds, `${prefix}.${event.id}.eraId`, 'era');
    requireFrom(event.worldspaceId, worldspaceIds, `${prefix}.${event.id}.worldspaceId`, 'worldspace');
    requireAllFrom(event.locationIds, locationIds, `${prefix}.${event.id}.locationIds`, 'location');
    requireAllFrom(event.participantEntityIds, entityIds, `${prefix}.${event.id}.participantEntityIds`, 'entity');
    requireAllFrom(event.causedByEventIds, historicalEventIds, `${prefix}.${event.id}.causedByEventIds`, 'event');
    requireAllFrom(event.causesEventIds, historicalEventIds, `${prefix}.${event.id}.causesEventIds`, 'event');
    requireAllFrom(event.relationshipIds, relationshipIds, `${prefix}.${event.id}.relationshipIds`, 'relationship');
    requireSources(event.sourceIds, `${prefix}.${event.id}.sourceIds`);
    requireAllFrom(event.claimIds, claimIds, `${prefix}.${event.id}.claimIds`, 'claim');
  };
  dataset.events.forEach((event) => validateEvent(event, 'events'));
  for (const battle of dataset.battles) {
    validateEvent(battle, 'battles');
    requireGeometry(battle.geometryId, `battles.${battle.id}.geometryId`);
    requireFrom(battle.campaignId, campaignIds, `battles.${battle.id}.campaignId`, 'campaign');
    battle.combatants.forEach((combatant) => {
      requireFrom(combatant.factionId, factionIds, `battles.${battle.id}.combatants.factionId`, 'faction');
      requireAllFrom(combatant.commanderEntityIds, entityIds, `battles.${battle.id}.combatants.commanderEntityIds`, 'entity');
    });
    battle.objectives?.forEach((objective) => requireFrom(objective.factionId, factionIds, `battles.${battle.id}.objectives.factionId`, 'faction'));
    requireFrom(battle.outcome.winnerFactionId, factionIds, `battles.${battle.id}.outcome.winnerFactionId`, 'faction');
    battle.phases?.forEach((phase) => {
      requireFrom(phase.routeId, routeIds, `battles.${battle.id}.phases.${phase.id}.routeId`, 'route');
      phase.visualActions?.forEach((action) => validateAction(action, `battles.${battle.id}.phases.${phase.id}`, { requireFrom, layerIds, battleIds, routeIds, locationIds, mapStateIds, entityIds, factionIds, relationshipIds, geometryIds: context.geometryIds }));
    });
  }
  for (const citation of dataset.citations) requireFrom(citation.sourceId, sourceIds, `citations.${citation.id}.sourceId`, 'source');
  for (const claim of dataset.claims) {
    requireFrom(claim.subjectId, subjectIds, `claims.${claim.id}.subjectId`, 'claim subject');
    requireAllFrom(claim.citationIds, citationIds, `claims.${claim.id}.citationIds`, 'citation');
    const subject = collections.flat().find((record) => record.id === claim.subjectId);
    const isPublished = subject && 'contentStatus' in subject && subject.contentStatus === 'published';
    if (isPublished && claim.status === 'active' && claim.confidence !== 'speculative' && claim.citationIds.length === 0) {
      issues.push({ code: 'missing-citation', path: claim.id, message: 'Published active non-speculative claim has no citation.' });
    }
  }
  for (const relationship of dataset.relationships) {
    requireFrom(relationship.fromId, subjectIds, `relationships.${relationship.id}.fromId`, 'relationship endpoint');
    requireFrom(relationship.toId, subjectIds, `relationships.${relationship.id}.toId`, 'relationship endpoint');
    requireAllFrom(relationship.citationIds, citationIds, `relationships.${relationship.id}.citationIds`, 'citation');
  }
  for (const guide of dataset.storyGuides) {
    requireFrom(guide.eraId, eraIds, `storyGuides.${guide.id}.eraId`, 'era');
    requireAllFrom(guide.nodeIds, nodeIds, `storyGuides.${guide.id}.nodeIds`, 'story node');
  }
  for (const node of dataset.storyNodes) {
    requireFrom(node.guideId, guideIds, `storyNodes.${node.id}.guideId`, 'story guide');
    requireAllFrom(node.battleIds, battleIds, `storyNodes.${node.id}.battleIds`, 'battle');
    requireAllFrom(node.eventIds, eventIds, `storyNodes.${node.id}.eventIds`, 'event');
    requireAllFrom(node.entityIds, entityIds, `storyNodes.${node.id}.entityIds`, 'entity');
    requireAllFrom(node.locationIds, locationIds, `storyNodes.${node.id}.locationIds`, 'location');
    requireAllFrom(node.optionalExploreEntityIds, entityIds, `storyNodes.${node.id}.optionalExploreEntityIds`, 'entity');
    requireFrom(node.previousNodeId, nodeIds, `storyNodes.${node.id}.previousNodeId`, 'story node');
    requireAllFrom(node.nextNodeIds, nodeIds, `storyNodes.${node.id}.nextNodeIds`, 'story node');
    node.visualActions?.forEach((action) => validateAction(action, `storyNodes.${node.id}`, { requireFrom, layerIds, battleIds, routeIds, locationIds, mapStateIds, entityIds, factionIds, relationshipIds, geometryIds: context.geometryIds }));
  }

  issues.push(...detectCausalCycles(dataset));
  return issues;
}

function validateAction(
  action: VisualAction,
  path: string,
  context: {
    requireFrom: (value: string | undefined, validIds: ReadonlySet<string>, path: string, kind: string) => void;
    layerIds: ReadonlySet<string>;
    battleIds: ReadonlySet<string>;
    routeIds: ReadonlySet<string>;
    locationIds: ReadonlySet<string>;
    mapStateIds: ReadonlySet<string>;
    entityIds: ReadonlySet<string>;
    factionIds: ReadonlySet<string>;
    relationshipIds: ReadonlySet<string>;
    geometryIds?: ReadonlySet<string>;
  },
) {
  const { requireFrom } = context;
  switch (action.type) {
    case 'toggle_layer': requireFrom(action.layerId, context.layerIds, `${path}.visualActions.layerId`, 'layer'); break;
    case 'show_battle': requireFrom(action.battleId, context.battleIds, `${path}.visualActions.battleId`, 'battle'); break;
    case 'show_route': requireFrom(action.routeId, context.routeIds, `${path}.visualActions.routeId`, 'route'); break;
    case 'focus_location': requireFrom(action.locationId, context.locationIds, `${path}.visualActions.locationId`, 'location'); break;
    case 'set_map_state': requireFrom(action.mapStateId, context.mapStateIds, `${path}.visualActions.mapStateId`, 'map state'); break;
    case 'highlight_entity': requireFrom(action.entityId, context.entityIds, `${path}.visualActions.entityId`, 'entity'); break;
    case 'highlight_faction': requireFrom(action.factionId, context.factionIds, `${path}.visualActions.factionId`, 'faction'); break;
    case 'show_region':
      if (context.geometryIds) requireFrom(action.regionId, context.geometryIds, `${path}.visualActions.regionId`, 'geometry');
      break;
    case 'show_relationships':
      action.relationshipIds.forEach((id) => requireFrom(id, context.relationshipIds, `${path}.visualActions.relationshipIds`, 'relationship'));
      break;
  }
}

function detectCausalCycles(dataset: LoreDataset): ValidationIssue[] {
  const adjacency = new Map<string, Set<string>>();
  const add = (from: string, to: string) => {
    const targets = adjacency.get(from) ?? new Set<string>();
    targets.add(to);
    adjacency.set(from, targets);
  };
  for (const event of [...dataset.events, ...dataset.battles]) {
    event.causesEventIds?.forEach((to) => add(event.id, to));
    event.causedByEventIds?.forEach((from) => add(from, event.id));
  }
  for (const edge of dataset.relationships) {
    if (edge.type === 'causes') add(edge.fromId, edge.toId);
    if (edge.type === 'caused_by') add(edge.toId, edge.fromId);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const cycles = new Set<string>();
  const visit = (id: string) => {
    if (visiting.has(id)) {
      cycles.add(id);
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    adjacency.get(id)?.forEach(visit);
    visiting.delete(id);
    visited.add(id);
  };
  adjacency.forEach((_, id) => visit(id));
  return [...cycles].map((id) => ({
    code: 'causal-cycle',
    path: id,
    message: `Unintended causal cycle includes ${id}.`,
  }));
}
