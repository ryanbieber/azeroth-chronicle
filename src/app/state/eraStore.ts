import { create } from 'zustand';

interface EraState {
  eraId: string;
  setEra: (eraId: string) => void;
}

export const useEraStore = create<EraState>((set) => ({
  eraId: 'black-empire',
  setEra: (eraId) => set({ eraId }),
}));
