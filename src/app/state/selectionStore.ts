import { create } from 'zustand';

export type Selection =
  | { kind: 'battle'; id: string }
  | { kind: 'entity'; id: string }
  | { kind: 'event'; id: string }
  | null;

export type SelectionOrigin = 'manual' | 'story';

interface SelectionState {
  selection: Selection;
  selectionOrigin: SelectionOrigin;
  select: (selection: Selection, origin?: SelectionOrigin) => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selection: null,
  selectionOrigin: 'manual',
  select: (selection, selectionOrigin = 'manual') => set({ selection, selectionOrigin }),
}));
