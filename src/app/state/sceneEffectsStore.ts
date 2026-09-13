import { create } from 'zustand';

interface SceneEffectsState {
  highlightedIds: string[];
  routeIds: string[];
  relationshipIds: string[];
  focusedLocationId: string | null;
  highlight: (id: string) => void;
  showRoute: (id: string) => void;
  showRelationships: (ids: string[]) => void;
  focusLocation: (id: string) => void;
  reset: () => void;
}

const initialState = {
  highlightedIds: [],
  routeIds: [],
  relationshipIds: [],
  focusedLocationId: null,
};

export const useSceneEffectsStore = create<SceneEffectsState>((set) => ({
  ...initialState,
  highlight: (id) => set((state) => ({ highlightedIds: [...new Set([...state.highlightedIds, id])] })),
  showRoute: (id) => set((state) => ({ routeIds: [...new Set([...state.routeIds, id])] })),
  showRelationships: (ids) => set({ relationshipIds: [...new Set(ids)] }),
  focusLocation: (focusedLocationId) => set({ focusedLocationId }),
  reset: () => set(initialState),
}));
