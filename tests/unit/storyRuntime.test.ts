import { describe, expect, it } from 'vitest';
import type { StoryNode } from '../../src/domain/types/lore';
import { selectionForStoryNode, visualActionsForStoryNode } from '../../src/lib/story/storyRuntime';

describe('story runtime context', () => {
  it('turns declared node records into explicit map emphasis actions', () => {
    const node = {
      id: 'node-example',
      guideId: 'guide-example',
      title: 'Context example',
      narration: 'Transcript',
      entityIds: ['entity-example'],
      locationIds: ['location-example'],
      battleIds: ['battle-example'],
      visualActions: [{ type: 'show_route', routeId: 'route-example' }],
    } satisfies StoryNode;

    expect(visualActionsForStoryNode(node)).toEqual([
      { type: 'highlight_entity', entityId: 'entity-example' },
      { type: 'focus_location', locationId: 'location-example' },
      { type: 'show_battle', battleId: 'battle-example' },
      { type: 'show_route', routeId: 'route-example' },
    ]);
  });

  it('chooses one contextual infograph focus for each story node', () => {
    const node = {
      id: 'node-example',
      guideId: 'guide-example',
      title: 'Context example',
      narration: 'Transcript',
      entityIds: ['entity-example'],
      locationIds: ['location-example'],
      eventIds: ['event-example'],
      battleIds: ['battle-example'],
    } satisfies StoryNode;

    expect(selectionForStoryNode(node)).toEqual({ kind: 'battle', id: 'battle-example' });
    expect(selectionForStoryNode({ ...node, battleIds: [] })).toEqual({ kind: 'entity', id: 'location-example' });
    expect(selectionForStoryNode({ ...node, battleIds: [], locationIds: [] })).toEqual({ kind: 'entity', id: 'entity-example' });
    expect(selectionForStoryNode({ ...node, battleIds: [], locationIds: [], entityIds: [] })).toEqual({ kind: 'event', id: 'event-example' });
    expect(selectionForStoryNode({ ...node, battleIds: [], locationIds: [], entityIds: ['one', 'two'] })).toEqual({ kind: 'event', id: 'event-example' });
  });
});
