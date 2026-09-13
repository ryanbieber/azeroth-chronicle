import { create } from 'zustand';

interface SourceFilterState {
  sourceIds: string[];
  setSourceIds: (sourceIds: string[]) => void;
}

export const useSourceFilterStore = create<SourceFilterState>((set) => ({
  sourceIds: [],
  setSourceIds: (sourceIds) => set({ sourceIds }),
}));
