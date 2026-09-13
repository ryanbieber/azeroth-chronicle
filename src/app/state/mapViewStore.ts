import { create } from 'zustand';
import type { CameraInstruction } from '../../domain/types/lore';

export interface CameraCommand extends CameraInstruction {
  id: number;
}

interface MapViewState {
  mapStateId: string | null;
  command: CameraCommand | null;
  settledPose: CameraInstruction | null;
  requestCamera: (instruction: CameraInstruction) => void;
  cancelCamera: () => void;
  skipCamera: () => void;
  settleCamera: (command: CameraCommand) => void;
  setMapState: (mapStateId: string | null) => void;
}

let nextCommandId = 1;

export const useMapViewStore = create<MapViewState>((set) => ({
  mapStateId: null,
  command: null,
  settledPose: null,
  requestCamera: (instruction) => set({ command: { ...instruction, id: nextCommandId++ } }),
  cancelCamera: () => set({ command: null }),
  skipCamera: () => set((state) => state.command
    ? { command: { ...state.command, id: nextCommandId++, durationMs: 0 } }
    : state),
  settleCamera: (command) => set({ command: null, settledPose: command }),
  setMapState: (mapStateId) => set({ mapStateId }),
}));
