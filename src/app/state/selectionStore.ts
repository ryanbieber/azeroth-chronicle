import { create } from 'zustand';

export type Selection =
  | { kind: 'battle'; id: string }
  | { kind: 'entity'; id: string }
  | { kind: 'event'; id: string }
  | null;

interface SelectionState {
  selection: Selection;
  select: (selection: Selection) => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selection: null,
  select: (selection) => set({ selection }),
}));
