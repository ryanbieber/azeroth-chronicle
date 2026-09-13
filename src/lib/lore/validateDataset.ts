import type { LoreDataset } from '../../domain/types/lore';

export interface ValidationIssue {
  code: 'duplicate-id' | 'duplicate-slug' | 'broken-reference' | 'missing-citation' | 'story-cycle';
  path: string;
  message: string;
}

export function validateDatasetReferences(dataset: LoreDataset): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const collections = [
    dataset.worldspaces,
    dataset.mapStates,
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
  for (const record of [...dataset.eras, ...dataset.entities, ...dataset.events, ...dataset.battles]) {
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

  for (const map of dataset.mapStates) requireId(map.worldspaceId, `mapStates.${map.id}.worldspaceId`);
  for (const era of dataset.eras) {
    requireId(era.worldspaceId, `eras.${era.id}.worldspaceId`);
    requireId(era.mapStateId, `eras.${era.id}.mapStateId`);
    requireId(era.storyGuideId, `eras.${era.id}.storyGuideId`);
    era.featuredEventIds.forEach((value) => requireId(value, `eras.${era.id}.featuredEventIds`));
    era.featuredBattleIds.forEach((value) => requireId(value, `eras.${era.id}.featuredBattleIds`));
  }
  for (const battle of dataset.battles) {
    requireId(battle.eraId, `battles.${battle.id}.eraId`);
    requireId(battle.worldspaceId, `battles.${battle.id}.worldspaceId`);
    battle.combatants.forEach((combatant) => requireId(combatant.factionId, `battles.${battle.id}.combatants`));
  }
  for (const guide of dataset.storyGuides) {
    requireId(guide.eraId, `storyGuides.${guide.id}.eraId`);
    guide.nodeIds.forEach((value) => requireId(value, `storyGuides.${guide.id}.nodeIds`));
  }
  for (const node of dataset.storyNodes) {
    requireId(node.guideId, `storyNodes.${node.id}.guideId`);
    node.battleIds?.forEach((value) => requireId(value, `storyNodes.${node.id}.battleIds`));
    node.eventIds?.forEach((value) => requireId(value, `storyNodes.${node.id}.eventIds`));
    node.entityIds?.forEach((value) => requireId(value, `storyNodes.${node.id}.entityIds`));
    if (node.previousNodeId) requireId(node.previousNodeId, `storyNodes.${node.id}.previousNodeId`);
    node.nextNodeIds?.forEach((value) => requireId(value, `storyNodes.${node.id}.nextNodeIds`));
  }
  for (const claim of dataset.claims) {
    requireId(claim.subjectId, `claims.${claim.id}.subjectId`);
    claim.citationIds.forEach((value) => requireId(value, `claims.${claim.id}.citationIds`));
    if (claim.status === 'active' && claim.confidence !== 'speculative' && claim.citationIds.length === 0) {
      issues.push({ code: 'missing-citation', path: claim.id, message: 'Active non-speculative claim has no citation.' });
    }
  }

  return issues;
}
