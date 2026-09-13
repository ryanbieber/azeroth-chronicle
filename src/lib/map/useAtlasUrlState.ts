import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEraStore } from '../../app/state/eraStore';
import { useLayerStore } from '../../app/state/layerStore';
import { useSelectionStore } from '../../app/state/selectionStore';
import type { LoreDataset } from '../../domain/types/lore';
import { parseAtlasUrl, serializeAtlasUrl } from './atlasUrlState';

export function useAtlasUrlState(dataset: LoreDataset) {
  const [params, setParams] = useSearchParams();
  const eraId = useEraStore((state) => state.eraId);
  const setEra = useEraStore((state) => state.setEra);
  const selection = useSelectionStore((state) => state.selection);
  const select = useSelectionStore((state) => state.select);
  const layers = useLayerStore((state) => state.visible);
  const setLayers = useLayerStore((state) => state.setLayers);
  const applyingUrl = useRef(false);
  const query = params.toString();

  useEffect(() => {
    const parsed = parseAtlasUrl(new URLSearchParams(query), dataset);
    applyingUrl.current = true;
    if (parsed.eraId) setEra(parsed.eraId);
    select(parsed.selection);
    setLayers(parsed.layers);
  }, [dataset, query, select, setEra, setLayers]);

  useEffect(() => {
    if (applyingUrl.current) {
      applyingUrl.current = false;
      return;
    }
    const next = serializeAtlasUrl({ eraId, selection, layers }, dataset);
    if (next.toString() !== query) setParams(next, { replace: true });
  }, [dataset, eraId, layers, query, selection, setParams]);
}
