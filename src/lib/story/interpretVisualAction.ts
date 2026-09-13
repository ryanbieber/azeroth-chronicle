import { useLayerStore } from '../../app/state/layerStore';
import { useSelectionStore } from '../../app/state/selectionStore';
import type { VisualAction } from '../../domain/types/lore';

export interface StoryActionPorts {
  setLayer: (layerId: string, visible: boolean) => void;
  selectBattle: (battleId: string) => void;
  showRoute: (routeId: string) => void;
  focusLocation: (locationId: string) => void;
  setMapState: (mapStateId: string) => void;
  highlight: (id: string) => void;
  showRelationships: (relationshipIds: string[]) => void;
}

export const defaultStoryActionPorts: StoryActionPorts = {
  setLayer: (layerId, visible) => useLayerStore.getState().setLayer(layerId, visible),
  selectBattle: (battleId) => useSelectionStore.getState().select({ kind: 'battle', id: battleId }),
  showRoute: () => useLayerStore.getState().setLayer('routes', true),
  focusLocation: () => undefined,
  setMapState: () => undefined,
  highlight: () => undefined,
  showRelationships: () => undefined,
};

export function interpretVisualAction(action: VisualAction, ports: StoryActionPorts = defaultStoryActionPorts) {
  switch (action.type) {
    case 'toggle_layer':
      ports.setLayer(action.layerId, action.visible);
      break;
    case 'show_battle':
      ports.setLayer('battles', true);
      ports.selectBattle(action.battleId);
      break;
    case 'show_route':
      ports.showRoute(action.routeId);
      break;
    case 'focus_location':
      ports.focusLocation(action.locationId);
      break;
    case 'set_map_state':
      ports.setMapState(action.mapStateId);
      break;
    case 'highlight_entity':
      ports.highlight(action.entityId);
      break;
    case 'highlight_faction':
      ports.highlight(action.factionId);
      break;
    case 'show_region':
      ports.highlight(action.regionId);
      break;
    case 'show_relationships':
      ports.showRelationships(action.relationshipIds);
      break;
  }
}
