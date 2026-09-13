import { describe, expect, it, vi } from 'vitest';
import { interpretVisualAction, type StoryActionPorts } from '../../src/lib/story/interpretVisualAction';

function ports(): StoryActionPorts {
  return {
    resetScene: vi.fn(),
    setLayer: vi.fn(),
    selectBattle: vi.fn(),
    showRoute: vi.fn(),
    focusLocation: vi.fn(),
    setMapState: vi.fn(),
    highlight: vi.fn(),
    showRelationships: vi.fn(),
  };
}

describe('story action interpreter', () => {
  it('reveals and selects a requested battle', () => {
    const target = ports();
    interpretVisualAction({ type: 'show_battle', battleId: 'example-battle' }, target);
    expect(target.setLayer).toHaveBeenCalledWith('battles', true);
    expect(target.selectBattle).toHaveBeenCalledWith('example-battle');
  });

  it('delegates layer changes to the map port', () => {
    const target = ports();
    interpretVisualAction({ type: 'toggle_layer', layerId: 'routes', visible: false }, target);
    expect(target.setLayer).toHaveBeenCalledWith('routes', false);
  });

  it('can rebuild a node from a known scene state', async () => {
    const { applyVisualActions } = await import('../../src/lib/story/interpretVisualAction');
    const target = ports();
    applyVisualActions([{ type: 'toggle_layer', layerId: 'routes', visible: true }], target);
    expect(target.resetScene).toHaveBeenCalledOnce();
    expect(target.setLayer).toHaveBeenCalledWith('routes', true);
  });

  it('delegates every non-battle action to its explicit port', () => {
    const target = ports();
    interpretVisualAction({ type: 'highlight_entity', entityId: 'entity-a' }, target);
    interpretVisualAction({ type: 'highlight_faction', factionId: 'faction-a' }, target);
    interpretVisualAction({ type: 'show_region', regionId: 'region-a' }, target);
    interpretVisualAction({ type: 'show_route', routeId: 'route-a' }, target);
    interpretVisualAction({ type: 'focus_location', locationId: 'location-a' }, target);
    interpretVisualAction({ type: 'set_map_state', mapStateId: 'state-a' }, target);
    interpretVisualAction({ type: 'show_relationships', relationshipIds: ['edge-a'] }, target);
    expect(target.highlight).toHaveBeenNthCalledWith(1, 'entity-a');
    expect(target.highlight).toHaveBeenNthCalledWith(2, 'faction-a');
    expect(target.highlight).toHaveBeenNthCalledWith(3, 'region-a');
    expect(target.showRoute).toHaveBeenCalledWith('route-a');
    expect(target.focusLocation).toHaveBeenCalledWith('location-a');
    expect(target.setMapState).toHaveBeenCalledWith('state-a');
    expect(target.showRelationships).toHaveBeenCalledWith(['edge-a']);
  });
});
