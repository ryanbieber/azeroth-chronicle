import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface NarrationState {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const useNarrationStore = create<NarrationState>()(persist(
  (set) => ({
    enabled: false,
    setEnabled: (enabled) => set({ enabled }),
  }),
  {
    name: 'azeroth-chronicle-narration',
    storage: createJSONStorage(() => localStorage),
  },
));
