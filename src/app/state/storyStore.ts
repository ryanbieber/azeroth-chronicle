import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface StoryReturnPoint {
  guideId: string;
  nodeId: string;
}

interface StoryState {
  guideId: string | null;
  nodeId: string | null;
  branchReturn: StoryReturnPoint | null;
  start: (guideId: string, nodeId: string) => void;
  goToNode: (nodeId: string) => void;
  stop: () => void;
  rememberBranch: () => void;
  resumeBranch: () => void;
}

export const useStoryStore = create<StoryState>()(persist(
  (set) => ({
    guideId: null,
    nodeId: null,
    branchReturn: null,
    start: (guideId, nodeId) => set({ guideId, nodeId, branchReturn: null }),
    goToNode: (nodeId) => set({ nodeId }),
    stop: () => set({ guideId: null, nodeId: null, branchReturn: null }),
    rememberBranch: () => set((state) => state.guideId && state.nodeId
      ? { branchReturn: { guideId: state.guideId, nodeId: state.nodeId } }
      : state),
    resumeBranch: () => set((state) => state.branchReturn
      ? { ...state.branchReturn, branchReturn: null }
      : state),
  }),
  {
    name: 'azeroth-chronicle-story',
    storage: createJSONStorage(() => sessionStorage),
    partialize: ({ guideId, nodeId, branchReturn }) => ({ guideId, nodeId, branchReturn }),
  },
));
