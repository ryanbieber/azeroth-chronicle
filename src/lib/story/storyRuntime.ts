import { useMapViewStore } from '../../app/state/mapViewStore';
import { useSelectionStore, type Selection } from '../../app/state/selectionStore';
import { useStoryStore } from '../../app/state/storyStore';
import { staticLoreRepository } from '../../domain/repositories/StaticLoreRepository';
import type { StoryNode, VisualAction } from '../../domain/types/lore';
import { applyVisualActions } from './interpretVisualAction';

export function visualActionsForStoryNode(node: StoryNode): VisualAction[] {
  return [
    ...(node.entityIds ?? []).map((entityId): VisualAction => ({ type: 'highlight_entity', entityId })),
    ...(node.locationIds ?? []).map((locationId): VisualAction => ({ type: 'focus_location', locationId })),
    ...(node.battleIds ?? []).map((battleId): VisualAction => ({ type: 'show_battle', battleId })),
    ...(node.visualActions ?? []),
  ];
}

export function selectionForStoryNode(node: StoryNode): Selection {
  if (node.battleIds?.[0]) return { kind: 'battle', id: node.battleIds[0] };
  if (node.locationIds?.[0]) return { kind: 'entity', id: node.locationIds[0] };
  const onlyEntityId = node.entityIds?.length === 1 ? node.entityIds[0] : undefined;
  if (onlyEntityId) return { kind: 'entity', id: onlyEntityId };
  if (node.eventIds?.[0]) return { kind: 'event', id: node.eventIds[0] };
  return null;
}

export function enterStoryNode(node: StoryNode): void {
  useStoryStore.getState().goToNode(node.id);
  useSelectionStore.getState().select(selectionForStoryNode(node), 'story');
  applyVisualActions(visualActionsForStoryNode(node));
  if (node.camera) useMapViewStore.getState().requestCamera(node.camera);
}

export function beginStoryGuide(guideId: string): boolean {
  const guide = staticLoreRepository.findStoryGuide(guideId);
  const firstNode = guide?.nodeIds[0] ? staticLoreRepository.findStoryNode(guide.nodeIds[0]) : undefined;
  if (!guide || !firstNode) return false;
  useStoryStore.getState().start(guide.id, firstNode.id);
  useSelectionStore.getState().select(selectionForStoryNode(firstNode), 'story');
  applyVisualActions(visualActionsForStoryNode(firstNode));
  if (firstNode.camera) useMapViewStore.getState().requestCamera(firstNode.camera);
  return true;
}

export function endStoryGuide(): void {
  useStoryStore.getState().stop();
  useSelectionStore.getState().select(null);
  useMapViewStore.getState().cancelCamera();
  applyVisualActions([]);
}
