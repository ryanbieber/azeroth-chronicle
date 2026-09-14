import { z } from 'zod';

const id = z.string().min(1).regex(/^[a-z0-9][a-z0-9-]*$/);
const vec3 = z.tuple([z.number(), z.number(), z.number()]);
const contentStatus = z.enum(['placeholder', 'research', 'reviewed', 'published']);
const confidence = z.enum(['explicit', 'strongly_supported', 'inferred', 'speculative']);
const geographicCertainty = z.enum(['exact', 'approximate', 'inferred', 'unknown']);

export const worldspaceSchema = z.object({
  id,
  name: z.string().min(1),
  slug: id,
  coordinateSystem: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    origin: z.enum(['top-left', 'bottom-left']),
    units: z.literal('atlas-units'),
  }),
});

export const mapStateSchema = z.object({
  id,
  name: z.string().min(1),
  worldspaceId: id,
  terrainAsset: z.string().optional(),
  terrainTextureAsset: z.string().optional(),
  terrainHeightAsset: z.string().optional(),
  geometryIds: z.array(id),
}).refine((value) => !value.terrainHeightAsset || value.terrainTextureAsset, {
  message: 'A terrain height map requires a terrain texture.',
});

export const spatialStateSchema = z.object({
  id,
  entityId: id,
  eraId: id,
  worldspaceId: id,
  geometryId: id.optional(),
  position: vec3.optional(),
  geographicCertainty,
  sourceIds: z.array(id),
  editorNote: z.string().optional(),
  labelPriority: z.number().int().min(0).optional(),
}).superRefine((value, context) => {
  if (value.geographicCertainty === 'unknown' && (value.geometryId || value.position)) {
    context.addIssue({ code: 'custom', message: 'Unknown geography cannot have exact geometry or a position.' });
  }
  if (value.geographicCertainty !== 'unknown' && !value.geometryId && !value.position) {
    context.addIssue({ code: 'custom', message: 'Known or inferred geography requires geometry or a position.' });
  }
  if (value.geographicCertainty === 'inferred' && !value.editorNote) {
    context.addIssue({ code: 'custom', message: 'Inferred geography requires an editor note.' });
  }
});

export const layerSchema = z.object({
  id,
  name: z.string().min(1),
  kind: z.enum(['regions', 'battles', 'locations', 'routes', 'labels']),
  description: z.string().optional(),
});

export const routeSchema = z.object({
  id,
  name: z.string().min(1),
  worldspaceId: id,
  geometryId: id,
  geographicCertainty,
  sourceIds: z.array(id),
  editorNote: z.string().optional(),
  contentStatus,
}).refine((value) => value.geographicCertainty !== 'inferred' || value.editorNote, {
  message: 'Inferred route geography requires an editor note.',
});

export const campaignSchema = z.object({
  id,
  name: z.string().min(1),
  slug: id,
  eraId: id,
  summary: z.string().min(1),
  battleIds: z.array(id),
  routeIds: z.array(id).optional(),
  sourceIds: z.array(id),
  contentStatus,
});

export const loreDateSchema = z.discriminatedUnion('precision', [
  z.object({ precision: z.literal('exact'), year: z.number().int(), label: z.string().optional() }),
  z.object({ precision: z.literal('approximate'), year: z.number().int().optional(), label: z.string() }),
  z.object({ precision: z.literal('relative'), label: z.string(), relativeToId: id.optional() }),
  z.object({ precision: z.literal('unknown'), label: z.string().optional() }),
]);

export const eraSchema = z.object({
  id,
  name: z.string().min(1),
  slug: id,
  worldspaceId: id,
  order: z.number().int(),
  startDate: loreDateSchema.optional(),
  endDate: loreDateSchema.optional(),
  dateLabel: z.string().optional(),
  summary: z.string().min(1),
  mapStateId: id,
  defaultLayerIds: z.array(id),
  featuredEventIds: z.array(id),
  featuredBattleIds: z.array(id),
  storyGuideId: id.optional(),
  previousEraId: id.optional(),
  nextEraId: id.optional(),
  sourceIds: z.array(id),
  contentStatus,
});

export const sourceSchema = z.object({
  id,
  title: z.string().min(1),
  sourceType: z.enum(['chronicle', 'novel', 'quest', 'short_story', 'cinematic', 'manual', 'website', 'other']),
  volume: z.string().optional(),
  publicationDate: z.string().optional(),
  notes: z.string().optional(),
});

export const loreEntitySchema = z.object({
  id,
  type: z.enum(['location', 'faction', 'character', 'artifact', 'site', 'other']),
  name: z.string().min(1),
  slug: id,
  aliases: z.array(z.string()).optional(),
  shortDescription: z.string().min(1),
  body: z.string().optional(),
  firstEraId: id.optional(),
  lastEraId: id.optional(),
  sourceIds: z.array(id),
  claimIds: z.array(id).optional(),
  tags: z.array(z.string()).optional(),
  contentStatus,
});

const eventBase = {
  id,
  name: z.string().min(1),
  slug: id,
  eraId: id,
  worldspaceId: id,
  date: loreDateSchema.optional(),
  summary: z.string().min(1),
  description: z.string().optional(),
  locationIds: z.array(id).optional(),
  participantEntityIds: z.array(id).optional(),
  causedByEventIds: z.array(id).optional(),
  causesEventIds: z.array(id).optional(),
  relationshipIds: z.array(id).optional(),
  sourceIds: z.array(id),
  claimIds: z.array(id).optional(),
  contentStatus,
};

export const eventSchema = z.object({ ...eventBase, kind: z.literal('event') });
export const battleSchema = z.object({
  ...eventBase,
  kind: z.literal('battle'),
  campaignId: id.optional(),
  combatants: z.array(z.object({
    factionId: id,
    role: z.enum(['attacker', 'defender', 'participant']),
    commanderEntityIds: z.array(id).optional(),
  })),
  objectives: z.array(z.object({ factionId: id.optional(), summary: z.string().min(1) })).optional(),
  phases: z.array(z.object({
    id,
    title: z.string().min(1),
    summary: z.string().min(1),
    routeId: id.optional(),
    durationMs: z.number().nonnegative().optional(),
    narration: z.string().optional(),
    camera: z.object({ position: vec3, target: vec3, durationMs: z.number().nonnegative().optional() }).optional(),
    visualActions: z.array(z.lazy(() => visualActionSchema)).optional(),
  })).optional(),
  outcome: z.object({ summary: z.string().min(1), winnerFactionId: id.optional() }),
  geographicCertainty,
  geographicEditorNote: z.string().optional(),
  animationId: id.optional(),
  importance: z.enum(['minor', 'major', 'era_defining']),
  position: vec3.optional(),
  geometryId: id.optional(),
}).superRefine((value, context) => {
  if (value.geographicCertainty === 'unknown' && value.position) {
    context.addIssue({ code: 'custom', message: 'Unknown battle geography cannot have an exact position.' });
  }
  if (value.geographicCertainty === 'unknown' && value.geometryId) {
    context.addIssue({ code: 'custom', message: 'Unknown battle geography cannot have exact geometry.' });
  }
  if (value.geographicCertainty !== 'unknown' && !value.position && !value.geometryId) {
    context.addIssue({ code: 'custom', message: 'Known battle geography requires geometry or a position.' });
  }
  if (value.geographicCertainty === 'inferred' && !value.geographicEditorNote) {
    context.addIssue({ code: 'custom', message: 'Inferred battle geography requires an editor note.' });
  }
});

export const visualActionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('highlight_entity'), entityId: id }),
  z.object({ type: z.literal('highlight_faction'), factionId: id }),
  z.object({ type: z.literal('show_region'), regionId: id }),
  z.object({ type: z.literal('show_route'), routeId: id }),
  z.object({ type: z.literal('show_battle'), battleId: id }),
  z.object({ type: z.literal('toggle_layer'), layerId: id, visible: z.boolean() }),
  z.object({ type: z.literal('set_map_state'), mapStateId: id }),
  z.object({ type: z.literal('focus_location'), locationId: id }),
  z.object({ type: z.literal('show_relationships'), relationshipIds: z.array(id) }),
]);

export const storyNodeSchema = z.object({
  id,
  guideId: id,
  title: z.string().min(1),
  narration: z.string().min(1),
  durationMs: z.number().int().positive().optional(),
  eventIds: z.array(id).optional(),
  battleIds: z.array(id).optional(),
  entityIds: z.array(id).optional(),
  locationIds: z.array(id).optional(),
  camera: z.object({ position: vec3, target: vec3, durationMs: z.number().nonnegative().optional() }).optional(),
  visualActions: z.array(visualActionSchema).optional(),
  optionalExploreEntityIds: z.array(id).optional(),
  previousNodeId: id.optional(),
  nextNodeIds: z.array(id).optional(),
});

export const storyGuideSchema = z.object({
  id,
  eraId: id,
  title: z.string().min(1),
  description: z.string().min(1),
  nodeIds: z.array(id),
  contentStatus,
});

export const relationshipSchema = z.object({
  id,
  fromId: id,
  toId: id,
  type: z.enum(['caused_by', 'causes', 'precedes', 'follows', 'part_of', 'participant_in', 'located_at', 'controls', 'opposes', 'allied_with', 'transforms_into', 'replaces', 'related_to']),
  citationIds: z.array(id),
  confidence,
});

export const citationSchema = z.object({
  id,
  sourceId: id,
  chapter: z.string().optional(),
  pageStart: z.number().int().positive().optional(),
  pageEnd: z.number().int().positive().optional(),
  questId: z.string().optional(),
  section: z.string().optional(),
  note: z.string().optional(),
});

export const claimSchema = z.object({
  id,
  subjectId: id,
  predicate: z.string().min(1),
  value: z.unknown(),
  citationIds: z.array(id),
  confidence,
  status: z.enum(['active', 'disputed', 'superseded']),
  editorNote: z.string().optional(),
});

export const loreDatasetSchema = z.object({
  worldspaces: z.array(worldspaceSchema),
  mapStates: z.array(mapStateSchema),
  spatialStates: z.array(spatialStateSchema),
  layers: z.array(layerSchema),
  routes: z.array(routeSchema),
  campaigns: z.array(campaignSchema),
  eras: z.array(eraSchema),
  entities: z.array(loreEntitySchema),
  events: z.array(eventSchema),
  battles: z.array(battleSchema),
  sources: z.array(sourceSchema),
  citations: z.array(citationSchema),
  claims: z.array(claimSchema),
  relationships: z.array(relationshipSchema),
  storyGuides: z.array(storyGuideSchema),
  storyNodes: z.array(storyNodeSchema),
});
