import { beforeEach, describe, expect, it } from 'vitest';
import { useNarrationStore } from '../../src/app/state/narrationStore';

describe('guided narration preference', () => {
  beforeEach(() => {
    localStorage.clear();
    useNarrationStore.setState({ enabled: false });
  });

  it('is opt-in and persists the visitor choice separately from story progress', () => {
    expect(useNarrationStore.getState().enabled).toBe(false);
    useNarrationStore.getState().setEnabled(true);
    expect(useNarrationStore.getState().enabled).toBe(true);

    const stored = JSON.parse(localStorage.getItem('azeroth-chronicle-narration') ?? '{}');
    expect(stored.state).toEqual({ enabled: true });
  });
});
