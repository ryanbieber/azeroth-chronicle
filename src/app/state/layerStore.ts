import { create } from 'zustand';

export type LayerId = 'regions' | 'battles' | 'routes' | 'labels';

interface LayerState {
  visible: Record<LayerId, boolean>;
  setLayer: (layerId: string, visible: boolean) => void;
  toggleLayer: (layerId: LayerId) => void;
}

export const useLayerStore = create<LayerState>((set) => ({
  visible: { regions: true, battles: true, routes: true, labels: true },
  setLayer: (layerId, visible) =>
    set((state) =>
      layerId in state.visible
        ? { visible: { ...state.visible, [layerId]: visible } }
        : state,
    ),
  toggleLayer: (layerId) =>
    set((state) => ({ visible: { ...state.visible, [layerId]: !state.visible[layerId] } })),
}));
