import { describe, expect, it, vi } from 'vitest';
import { interpretVisualAction, type StoryActionPorts } from '../../src/lib/story/interpretVisualAction';

function ports(): StoryActionPorts {
  return {
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
});
