import { create } from 'zustand';

export type LayerId = 'regions' | 'battles' | 'locations' | 'routes' | 'labels';

interface LayerState {
  visible: Record<LayerId, boolean>;
  setLayer: (layerId: string, visible: boolean) => void;
  setLayers: (visible: Record<LayerId, boolean>) => void;
  toggleLayer: (layerId: LayerId) => void;
  reset: () => void;
}

export const useLayerStore = create<LayerState>((set) => ({
  visible: { regions: true, battles: true, locations: true, routes: true, labels: true },
  setLayer: (layerId, visible) =>
    set((state) =>
      layerId in state.visible
        ? { visible: { ...state.visible, [layerId]: visible } }
        : state,
    ),
  setLayers: (visible) => set({ visible }),
  toggleLayer: (layerId) =>
    set((state) => ({ visible: { ...state.visible, [layerId]: !state.visible[layerId] } })),
  reset: () => set({ visible: { regions: true, battles: true, locations: true, routes: true, labels: true } }),
}));
