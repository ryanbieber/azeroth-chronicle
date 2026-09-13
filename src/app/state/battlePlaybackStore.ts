import { create } from 'zustand';

type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'complete';

interface BattlePlaybackState {
  battleId: string | null;
  phaseIndex: number;
  status: PlaybackStatus;
  load: (battleId: string) => void;
  play: () => void;
  pause: () => void;
  goToPhase: (phaseIndex: number) => void;
  restart: () => void;
  complete: (phaseIndex: number) => void;
}

export const useBattlePlaybackStore = create<BattlePlaybackState>((set) => ({
  battleId: null,
  phaseIndex: 0,
  status: 'idle',
  load: (battleId) => set((state) => state.battleId === battleId ? state : { battleId, phaseIndex: 0, status: 'idle' }),
  play: () => set({ status: 'playing' }),
  pause: () => set({ status: 'paused' }),
  goToPhase: (phaseIndex) => set({ phaseIndex, status: 'paused' }),
  restart: () => set({ phaseIndex: 0, status: 'idle' }),
  complete: (phaseIndex) => set({ phaseIndex, status: 'complete' }),
}));
