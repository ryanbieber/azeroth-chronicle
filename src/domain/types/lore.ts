export type EntityId = string;

export type LoreDate =
  | { precision: 'exact'; year: number; label?: string }
  | { precision: 'approximate'; year?: number; label: string }
  | { precision: 'relative'; label: string; relativeToId?: EntityId }
  | { precision: 'unknown'; label?: string };

export type Confidence = 'explicit' | 'strongly_supported' | 'inferred' | 'speculative';
export type GeographicCertainty = 'exact' | 'approximate' | 'inferred' | 'unknown';

export interface Source {
  id: EntityId;
  title: string;
  sourceType:
    | 'chronicle'
    | 'novel'
    | 'quest'
    | 'short_story'
    | 'cinematic'
    | 'manual'
    | 'website'
    | 'other';
  volume?: string;
  publicationDate?: string;
  notes?: string;
}

export interface Citation {
  id: EntityId;
  sourceId: EntityId;
  chapter?: string;
  pageStart?: number;
  pageEnd?: number;
  questId?: string;
  section?: string;
  note?: string;
}

export interface Claim {
  id: EntityId;
  subjectId: EntityId;
  predicate: string;
  value: unknown;
  citationIds: EntityId[];
  confidence: Confidence;
  status: 'active' | 'disputed' | 'superseded';
  editorNote?: string;
  labelPriority?: number;
}

export interface Worldspace {
  id: EntityId;
  name: string;
  slug: string;
  coordinateSystem: {
    width: number;
    height: number;
    origin: 'top-left' | 'bottom-left';
    units: 'atlas-units';
  };
}

export interface MapState {
  id: EntityId;
  name: string;
  worldspaceId: EntityId;
  terrainAsset?: string;
  terrainTextureAsset?: string;
  terrainHeightAsset?: string;
  geometryIds: EntityId[];
}

export interface Era {
  id: EntityId;
  name: string;
  slug: string;
  worldspaceId: EntityId;
  order: number;
  startDate?: LoreDate;
  endDate?: LoreDate;
  dateLabel?: string;
  summary: string;
  mapStateId: EntityId;
  defaultLayerIds: EntityId[];
  featuredEventIds: EntityId[];
  featuredBattleIds: EntityId[];
  storyGuideId?: EntityId;
  previousEraId?: EntityId;
  nextEraId?: EntityId;
  sourceIds: EntityId[];
  contentStatus: 'placeholder' | 'research' | 'reviewed' | 'published';
}

export type LoreEntityType =
  | 'location'
  | 'faction'
  | 'character'
  | 'artifact'
  | 'site'
  | 'other';

export interface LoreEntity {
  id: EntityId;
  type: LoreEntityType;
  name: string;
  slug: string;
  aliases?: string[];
  shortDescription: string;
  body?: string;
  firstEraId?: EntityId;
  lastEraId?: EntityId;
  sourceIds: EntityId[];
  claimIds?: EntityId[];
  tags?: string[];
  contentStatus: 'placeholder' | 'research' | 'reviewed' | 'published';
}

export interface SpatialState {
  id: EntityId;
  entityId: EntityId;
  eraId: EntityId;
  worldspaceId: EntityId;
  geometryId?: EntityId;
  position?: [number, number, number];
  geographicCertainty: GeographicCertainty;
  sourceIds: EntityId[];
  editorNote?: string;
  labelPriority?: number;
}

export interface LayerDefinition {
  id: EntityId;
  name: string;
  kind: 'regions' | 'battles' | 'locations' | 'routes' | 'labels';
  description?: string;
}

export interface Route {
  id: EntityId;
  name: string;
  worldspaceId: EntityId;
  geometryId: EntityId;
  geographicCertainty: GeographicCertainty;
  sourceIds: EntityId[];
  editorNote?: string;
  contentStatus: 'placeholder' | 'research' | 'reviewed' | 'published';
}

export interface Campaign {
  id: EntityId;
  name: string;
  slug: string;
  eraId: EntityId;
  summary: string;
  battleIds: EntityId[];
  routeIds?: EntityId[];
  sourceIds: EntityId[];
  contentStatus: 'placeholder' | 'research' | 'reviewed' | 'published';
}

export interface LoreEvent {
  id: EntityId;
  kind: 'event' | 'battle';
  name: string;
  slug: string;
  eraId: EntityId;
  worldspaceId: EntityId;
  date?: LoreDate;
  summary: string;
  description?: string;
  locationIds?: EntityId[];
  participantEntityIds?: EntityId[];
  causedByEventIds?: EntityId[];
  causesEventIds?: EntityId[];
  relationshipIds?: EntityId[];
  sourceIds: EntityId[];
  claimIds?: EntityId[];
  contentStatus: 'placeholder' | 'research' | 'reviewed' | 'published';
}

export interface BattleCombatant {
  factionId: EntityId;
  role: 'attacker' | 'defender' | 'participant';
  commanderEntityIds?: EntityId[];
}

export interface BattlePhase {
  id: EntityId;
  title: string;
  summary: string;
  routeId?: EntityId;
  durationMs?: number;
  narration?: string;
  camera?: CameraInstruction;
  visualActions?: VisualAction[];
}

export interface Battle extends LoreEvent {
  kind: 'battle';
  campaignId?: EntityId;
  combatants: BattleCombatant[];
  objectives?: Array<{ factionId?: EntityId; summary: string }>;
  phases?: BattlePhase[];
  outcome: { summary: string; winnerFactionId?: EntityId };
  geographicCertainty: GeographicCertainty;
  geographicEditorNote?: string;
  animationId?: EntityId;
  importance: 'minor' | 'major' | 'era_defining';
  position?: [number, number, number];
  geometryId?: EntityId;
}

export type RelationshipType =
  | 'caused_by'
  | 'causes'
  | 'precedes'
  | 'follows'
  | 'part_of'
  | 'participant_in'
  | 'located_at'
  | 'controls'
  | 'opposes'
  | 'allied_with'
  | 'transforms_into'
  | 'replaces'
  | 'related_to';

export interface Relationship {
  id: EntityId;
  fromId: EntityId;
  toId: EntityId;
  type: RelationshipType;
  citationIds: EntityId[];
  confidence: Confidence;
}

export type VisualAction =
  | { type: 'highlight_entity'; entityId: EntityId }
  | { type: 'highlight_faction'; factionId: EntityId }
  | { type: 'show_region'; regionId: EntityId }
  | { type: 'show_route'; routeId: EntityId }
  | { type: 'show_battle'; battleId: EntityId }
  | { type: 'toggle_layer'; layerId: EntityId; visible: boolean }
  | { type: 'set_map_state'; mapStateId: EntityId }
  | { type: 'focus_location'; locationId: EntityId }
  | { type: 'show_relationships'; relationshipIds: EntityId[] };

export interface CameraInstruction {
  position: [number, number, number];
  target: [number, number, number];
  durationMs?: number;
}

export interface StoryNode {
  id: EntityId;
  guideId: EntityId;
  title: string;
  narration: string;
  durationMs?: number;
  eventIds?: EntityId[];
  battleIds?: EntityId[];
  entityIds?: EntityId[];
  locationIds?: EntityId[];
  camera?: CameraInstruction;
  visualActions?: VisualAction[];
  optionalExploreEntityIds?: EntityId[];
  previousNodeId?: EntityId;
  nextNodeIds?: EntityId[];
}

export interface StoryGuide {
  id: EntityId;
  eraId: EntityId;
  title: string;
  description: string;
  nodeIds: EntityId[];
  contentStatus: 'placeholder' | 'research' | 'reviewed' | 'published';
}

export interface LoreDataset {
  worldspaces: Worldspace[];
  mapStates: MapState[];
  spatialStates: SpatialState[];
  layers: LayerDefinition[];
  routes: Route[];
  campaigns: Campaign[];
  eras: Era[];
  entities: LoreEntity[];
  events: LoreEvent[];
  battles: Battle[];
  sources: Source[];
  citations: Citation[];
  claims: Claim[];
  relationships: Relationship[];
  storyGuides: StoryGuide[];
  storyNodes: StoryNode[];
}
