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

  const requireId = (value: string | undefined, path: string) => {
    if (value && !ids.has(value)) {
      issues.push({ code: 'broken-reference', path, message: `Unknown ID: ${value}` });
    }
  };
  const requireIds = (values: string[] | undefined, path: string) =>
    values?.forEach((value) => requireId(value, path));
  const requireGeometry = (value: string | undefined, path: string) => {
    if (value && context.geometryIds && !context.geometryIds.has(value)) {
      issues.push({ code: 'broken-reference', path, message: `Unknown geometry ID: ${value}` });
    }
  };
  const requireSources = (values: string[], path: string) => requireIds(values, path);

  for (const map of dataset.mapStates) {
    requireId(map.worldspaceId, `mapStates.${map.id}.worldspaceId`);
    map.geometryIds.forEach((value) => requireGeometry(value, `mapStates.${map.id}.geometryIds`));
  }
  for (const state of dataset.spatialStates) {
    requireId(state.entityId, `spatialStates.${state.id}.entityId`);
    requireId(state.eraId, `spatialStates.${state.id}.eraId`);
    requireId(state.worldspaceId, `spatialStates.${state.id}.worldspaceId`);
    requireGeometry(state.geometryId, `spatialStates.${state.id}.geometryId`);
    requireSources(state.sourceIds, `spatialStates.${state.id}.sourceIds`);
  }
  for (const route of dataset.routes) {
    requireId(route.worldspaceId, `routes.${route.id}.worldspaceId`);
    requireGeometry(route.geometryId, `routes.${route.id}.geometryId`);
    requireSources(route.sourceIds, `routes.${route.id}.sourceIds`);
  }
  for (const campaign of dataset.campaigns) {
    requireId(campaign.eraId, `campaigns.${campaign.id}.eraId`);
    requireIds(campaign.battleIds, `campaigns.${campaign.id}.battleIds`);
    requireIds(campaign.routeIds, `campaigns.${campaign.id}.routeIds`);
    requireSources(campaign.sourceIds, `campaigns.${campaign.id}.sourceIds`);
  }
  for (const era of dataset.eras) {
    requireId(era.worldspaceId, `eras.${era.id}.worldspaceId`);
    requireId(era.mapStateId, `eras.${era.id}.mapStateId`);
    requireId(era.storyGuideId, `eras.${era.id}.storyGuideId`);
    requireId(era.previousEraId, `eras.${era.id}.previousEraId`);
    requireId(era.nextEraId, `eras.${era.id}.nextEraId`);
    requireIds(era.defaultLayerIds, `eras.${era.id}.defaultLayerIds`);
    requireIds(era.featuredEventIds, `eras.${era.id}.featuredEventIds`);
    requireIds(era.featuredBattleIds, `eras.${era.id}.featuredBattleIds`);
    requireSources(era.sourceIds, `eras.${era.id}.sourceIds`);
  }
  for (const entity of dataset.entities) {
    requireId(entity.firstEraId, `entities.${entity.id}.firstEraId`);
    requireId(entity.lastEraId, `entities.${entity.id}.lastEraId`);
    requireSources(entity.sourceIds, `entities.${entity.id}.sourceIds`);
    requireIds(entity.claimIds, `entities.${entity.id}.claimIds`);
  }

  const validateEvent = (event: LoreDataset['events'][number] | LoreDataset['battles'][number], prefix: string) => {
    requireId(event.eraId, `${prefix}.${event.id}.eraId`);
    requireId(event.worldspaceId, `${prefix}.${event.id}.worldspaceId`);
    requireIds(event.locationIds, `${prefix}.${event.id}.locationIds`);
    requireIds(event.participantEntityIds, `${prefix}.${event.id}.participantEntityIds`);
    requireIds(event.causedByEventIds, `${prefix}.${event.id}.causedByEventIds`);
    requireIds(event.causesEventIds, `${prefix}.${event.id}.causesEventIds`);
    requireIds(event.relationshipIds, `${prefix}.${event.id}.relationshipIds`);
    requireSources(event.sourceIds, `${prefix}.${event.id}.sourceIds`);
    requireIds(event.claimIds, `${prefix}.${event.id}.claimIds`);
  };
  dataset.events.forEach((event) => validateEvent(event, 'events'));
  for (const battle of dataset.battles) {
    validateEvent(battle, 'battles');
    requireGeometry(battle.geometryId, `battles.${battle.id}.geometryId`);
    requireId(battle.campaignId, `battles.${battle.id}.campaignId`);
    battle.combatants.forEach((combatant) => {
      requireId(combatant.factionId, `battles.${battle.id}.combatants.factionId`);
      requireIds(combatant.commanderEntityIds, `battles.${battle.id}.combatants.commanderEntityIds`);
    });
    battle.objectives?.forEach((objective) => requireId(objective.factionId, `battles.${battle.id}.objectives.factionId`));
    requireId(battle.outcome.winnerFactionId, `battles.${battle.id}.outcome.winnerFactionId`);
    battle.phases?.forEach((phase) => {
      requireId(phase.routeId, `battles.${battle.id}.phases.${phase.id}.routeId`);
      phase.visualActions?.forEach((action) => validateAction(action, `battles.${battle.id}.phases.${phase.id}`, requireId));
    });
  }
  for (const citation of dataset.citations) requireId(citation.sourceId, `citations.${citation.id}.sourceId`);
  for (const claim of dataset.claims) {
    requireId(claim.subjectId, `claims.${claim.id}.subjectId`);
    requireIds(claim.citationIds, `claims.${claim.id}.citationIds`);
    const subject = collections.flat().find((record) => record.id === claim.subjectId);
    const isPublished = subject && 'contentStatus' in subject && subject.contentStatus === 'published';
    if (isPublished && claim.status === 'active' && claim.confidence !== 'speculative' && claim.citationIds.length === 0) {
      issues.push({ code: 'missing-citation', path: claim.id, message: 'Published active non-speculative claim has no citation.' });
    }
  }
  for (const relationship of dataset.relationships) {
    requireId(relationship.fromId, `relationships.${relationship.id}.fromId`);
    requireId(relationship.toId, `relationships.${relationship.id}.toId`);
    requireIds(relationship.citationIds, `relationships.${relationship.id}.citationIds`);
  }
  for (const guide of dataset.storyGuides) {
    requireId(guide.eraId, `storyGuides.${guide.id}.eraId`);
    requireIds(guide.nodeIds, `storyGuides.${guide.id}.nodeIds`);
  }
  for (const node of dataset.storyNodes) {
    requireId(node.guideId, `storyNodes.${node.id}.guideId`);
    requireIds(node.battleIds, `storyNodes.${node.id}.battleIds`);
    requireIds(node.eventIds, `storyNodes.${node.id}.eventIds`);
    requireIds(node.entityIds, `storyNodes.${node.id}.entityIds`);
    requireIds(node.locationIds, `storyNodes.${node.id}.locationIds`);
    requireIds(node.optionalExploreEntityIds, `storyNodes.${node.id}.optionalExploreEntityIds`);
    requireId(node.previousNodeId, `storyNodes.${node.id}.previousNodeId`);
    requireIds(node.nextNodeIds, `storyNodes.${node.id}.nextNodeIds`);
    node.visualActions?.forEach((action) => validateAction(action, `storyNodes.${node.id}`, requireId));
  }

  issues.push(...detectCausalCycles(dataset));
  return issues;
}

function validateAction(
  action: VisualAction,
  path: string,
  requireId: (value: string | undefined, path: string) => void,
) {
  switch (action.type) {
    case 'toggle_layer': requireId(action.layerId, `${path}.visualActions.layerId`); break;
    case 'show_battle': requireId(action.battleId, `${path}.visualActions.battleId`); break;
    case 'show_route': requireId(action.routeId, `${path}.visualActions.routeId`); break;
    case 'focus_location': requireId(action.locationId, `${path}.visualActions.locationId`); break;
    case 'set_map_state': requireId(action.mapStateId, `${path}.visualActions.mapStateId`); break;
    case 'highlight_entity': requireId(action.entityId, `${path}.visualActions.entityId`); break;
    case 'highlight_faction': requireId(action.factionId, `${path}.visualActions.factionId`); break;
    case 'show_region': requireId(action.regionId, `${path}.visualActions.regionId`); break;
    case 'show_relationships': action.relationshipIds.forEach((id) => requireId(id, `${path}.visualActions.relationshipIds`)); break;
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
