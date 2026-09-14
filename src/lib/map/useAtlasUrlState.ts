import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEraStore } from '../../app/state/eraStore';
import { useSelectionStore } from '../../app/state/selectionStore';
import type { LoreDataset } from '../../domain/types/lore';
import { layerIds, parseAtlasUrl, serializeAtlasUrl } from './atlasUrlState';

const curatedLayers = Object.fromEntries(layerIds.map((id) => [id, true])) as Record<(typeof layerIds)[number], boolean>;

export function useAtlasUrlState(dataset: LoreDataset) {
  const [params, setParams] = useSearchParams();
  const eraId = useEraStore((state) => state.eraId);
  const setEra = useEraStore((state) => state.setEra);
  const selection = useSelectionStore((state) => state.selection);
  const select = useSelectionStore((state) => state.select);
  const applyingUrl = useRef(false);
  const query = params.toString();

  useEffect(() => {
    const parsed = parseAtlasUrl(new URLSearchParams(query), dataset);
    applyingUrl.current = true;
    if (parsed.eraId) setEra(parsed.eraId);
    select(parsed.selection);
  }, [dataset, query, select, setEra]);

  useEffect(() => {
    if (applyingUrl.current) {
      applyingUrl.current = false;
      return;
    }
    const next = serializeAtlasUrl({ eraId, selection, layers: curatedLayers }, dataset);
    if (next.toString() !== query) setParams(next, { replace: true });
  }, [dataset, eraId, query, selection, setParams]);
}
