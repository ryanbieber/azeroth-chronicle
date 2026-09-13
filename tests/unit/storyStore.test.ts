import { beforeEach, describe, expect, it } from 'vitest';
import { useStoryStore } from '../../src/app/state/storyStore';

describe('story progress', () => {
  beforeEach(() => {
    sessionStorage.clear();
    useStoryStore.setState({ guideId: null, nodeId: null, branchReturn: null });
  });

  it('remembers and restores the exact branch return point', () => {
    const story = useStoryStore.getState();
    story.start('guide-a', 'node-three');
    useStoryStore.getState().rememberBranch();
    useStoryStore.getState().goToNode('node-four');
    useStoryStore.getState().resumeBranch();
    expect(useStoryStore.getState()).toMatchObject({
      guideId: 'guide-a',
      nodeId: 'node-three',
      branchReturn: null,
    });
  });

  it('writes durable guide/node progress but not animation state to session storage', () => {
    useStoryStore.getState().start('guide-a', 'node-one');
    const stored = JSON.parse(sessionStorage.getItem('azeroth-chronicle-story') ?? '{}');
    expect(stored.state).toMatchObject({ guideId: 'guide-a', nodeId: 'node-one' });
  });
});
