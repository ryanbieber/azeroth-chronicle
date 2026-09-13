import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLayerStore, type LayerId } from '../app/state/layerStore';
import { useSelectionStore } from '../app/state/selectionStore';
import { BattleDossier } from '../components/dossier/BattleDossier';
import { MapViewport3D } from '../components/map/MapViewport3D';
import { StoryGuidePanel } from '../components/story/StoryGuidePanel';
import { staticLoreRepository } from '../domain/repositories/StaticLoreRepository';

const layerLabels: Record<LayerId, string> = {
  regions: 'Domains',
  battles: 'Battles',
  routes: 'Routes',
  labels: 'Labels',
};

export function MapPage() {
  const [params, setParams] = useSearchParams();
  const dataset = staticLoreRepository.getDataset();
  const era = staticLoreRepository.findEraBySlug(params.get('era') ?? 'black-empire') ?? dataset.eras[0];
  const battle = dataset.battles[0];
  const selected = useSelectionStore((state) => state.selection);
  const select = useSelectionStore((state) => state.select);
  const layers = useLayerStore((state) => state.visible);
  const toggleLayer = useLayerStore((state) => state.toggleLayer);

  useEffect(() => {
    const battleSlug = params.get('battle');
    if (battleSlug) {
      const linkedBattle = staticLoreRepository.findBattleBySlug(battleSlug);
      if (linkedBattle) select({ kind: 'battle', id: linkedBattle.id });
    }
  }, [params, select]);

  useEffect(() => {
    const selectedBattle = selected?.kind === 'battle'
      ? dataset.battles.find((item) => item.id === selected.id)
      : undefined;
    const next = new URLSearchParams(params);
    if (selectedBattle) next.set('battle', selectedBattle.slug);
    else next.delete('battle');
    if (next.toString() !== params.toString()) setParams(next, { replace: true });
  }, [dataset.battles, params, selected, setParams]);

  if (!era || !battle) return <main className="empty-state">No validated era fixture is available.</main>;

  return (
    <main className="atlas-layout">
      <aside className="archive-panel" aria-label="Atlas controls">
        <p className="eyebrow">Era archive</p>
        <h1>{era.name}</h1>
        <p>{era.summary}</p>
        <label className="search-field">
          <span>Search archive</span>
          <input type="search" placeholder="Search is planned" disabled />
        </label>
        <section className="layers" aria-labelledby="layers-heading">
          <h2 id="layers-heading">Visible layers</h2>
          {(Object.keys(layerLabels) as LayerId[]).map((layerId) => (
            <label key={layerId}>
              <input
                type="checkbox"
                checked={layers[layerId]}
                onChange={() => toggleLayer(layerId)}
              />
              <span>{layerLabels[layerId]}</span>
            </label>
          ))}
        </section>
        {era.storyGuideId && <StoryGuidePanel guideId={era.storyGuideId} />}
      </aside>

      <MapViewport3D battle={battle} />

      <aside className="detail-panel" aria-label="Selected record">
        {selected?.kind === 'battle' ? (
          <BattleDossier battle={battle} entities={dataset.entities} compact />
        ) : (
          <section className="selection-prompt">
            <p className="eyebrow">Historical record</p>
            <h2>Select a marker</h2>
            <p>Choose a battle or begin the guided prototype to inspect a structured dossier.</p>
          </section>
        )}
      </aside>

      <div className="timeline" aria-label="Era timeline">
        <span className="timeline-dot" />
        <strong>{era.name}</strong>
        <span>{era.dateLabel}</span>
      </div>
    </main>
  );
}
