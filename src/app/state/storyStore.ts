import { create } from 'zustand';

interface StoryState {
  guideId: string | null;
  nodeId: string | null;
  returnSelectionId: string | null;
  start: (guideId: string, nodeId: string) => void;
  goToNode: (nodeId: string) => void;
  stop: () => void;
  rememberBranch: (selectionId: string | null) => void;
}

export const useStoryStore = create<StoryState>((set) => ({
  guideId: null,
  nodeId: null,
  returnSelectionId: null,
  start: (guideId, nodeId) => set({ guideId, nodeId, returnSelectionId: null }),
  goToNode: (nodeId) => set({ nodeId }),
  stop: () => set({ guideId: null, nodeId: null, returnSelectionId: null }),
  rememberBranch: (returnSelectionId) => set({ returnSelectionId }),
}));
