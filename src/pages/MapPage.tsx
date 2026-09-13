import { useLayerStore, type LayerId } from '../app/state/layerStore';
import { useEraStore } from '../app/state/eraStore';
import { useSelectionStore } from '../app/state/selectionStore';
import { useSourceFilterStore } from '../app/state/sourceFilterStore';
import { BattleDossier } from '../components/dossier/BattleDossier';
import { EntityDossier } from '../components/dossier/EntityDossier';
import { EventDossier } from '../components/dossier/EventDossier';
import { MapViewport3D } from '../components/map/MapViewport3D';
import { StoryGuidePanel } from '../components/story/StoryGuidePanel';
import { ArchiveSearch } from '../components/search/ArchiveSearch';
import { SourceFilterPanel } from '../components/provenance/SourceFilterPanel';
import { staticLoreRepository } from '../domain/repositories/StaticLoreRepository';
import { adaptGeometry } from '../lib/map/geometryAdapter';
import { useAtlasUrlState } from '../lib/map/useAtlasUrlState';
import { useMapViewStore } from '../app/state/mapViewStore';

const layerLabels: Record<LayerId, string> = {
  regions: 'Domains',
  battles: 'Battles',
  locations: 'Locations',
  routes: 'Routes',
  labels: 'Labels',
};

export function MapPage() {
  const dataset = staticLoreRepository.getDataset();
  useAtlasUrlState(dataset);
  const eraId = useEraStore((state) => state.eraId);
  const era = dataset.eras.find((item) => item.id === eraId) ?? dataset.eras[0];
  const battle = dataset.battles[0];
  const requestedMapStateId = useMapViewStore((state) => state.mapStateId);
  const mapState = dataset.mapStates.find((item) => item.id === requestedMapStateId && item.worldspaceId === era?.worldspaceId)
    ?? dataset.mapStates.find((item) => item.id === era?.mapStateId);
  const worldspace = dataset.worldspaces.find((item) => item.id === era?.worldspaceId);
  const selected = useSelectionStore((state) => state.selection);
  const layers = useLayerStore((state) => state.visible);
  const toggleLayer = useLayerStore((state) => state.toggleLayer);
  const setEra = useEraStore((state) => state.setEra);
  const sourceIds = useSourceFilterStore((state) => state.sourceIds);
  const visibleBattles = staticLoreRepository.listBattlesForEra(era?.id ?? '', sourceIds);
  const visibleEntities = staticLoreRepository.listEntitiesForEra(era?.id ?? '', sourceIds);
  const visibleEntityIds = new Set(visibleEntities.map((item) => item.id));
  const visibleEvents = dataset.events.filter((event) => event.eraId === era?.id
    && (sourceIds.length === 0 || event.sourceIds.some((id) => sourceIds.includes(id))));
  const visibleRoutes = dataset.routes.filter((route) => sourceIds.length === 0
    || route.sourceIds.some((id) => sourceIds.includes(id)));
  const visibleSpatialStates = dataset.spatialStates.filter((state) => state.eraId === era?.id
    && visibleEntityIds.has(state.entityId)
    && (sourceIds.length === 0 || state.sourceIds.some((id) => sourceIds.includes(id))));

  if (!era || !battle || !mapState || !worldspace) {
    return <main className="empty-state">No validated era fixture is available.</main>;
  }

  const geometryCollection = mapState.geometryIds
    .map((id) => staticLoreRepository.getGeometry(id))
    .find((item) => item !== undefined);
  const allGeometry = geometryCollection
    ? adaptGeometry(geometryCollection, worldspace.coordinateSystem)
    : [];
  const permittedGeometryIds = new Set([
    ...visibleRoutes.map((route) => route.geometryId),
    ...visibleSpatialStates.flatMap((state) => state.geometryId ? [state.geometryId] : []),
    ...visibleBattles.flatMap((item) => item.geometryId ? [item.geometryId] : []),
  ]);
  const geometry = sourceIds.length === 0
    ? allGeometry
    : allGeometry.filter((item) => permittedGeometryIds.has(item.id));

  return (
    <main className="atlas-layout">
      <aside className="archive-panel" aria-label="Atlas controls">
        <p className="eyebrow">Era archive</p>
        <label className="era-selector">
          <span>Active era</span>
          <select value={era.id} onChange={(event) => setEra(event.target.value)}>
            {staticLoreRepository.listEras().map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <h1>{era.name}</h1>
        <p>{era.summary}</p>
        <ArchiveSearch eraId={era.id} />
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
        <SourceFilterPanel />
        {era.storyGuideId && <StoryGuidePanel guideId={era.storyGuideId} />}
      </aside>

      <MapViewport3D
        battle={battle}
        battleVisible={visibleBattles.some((item) => item.id === battle.id)}
        entities={visibleEntities}
        geometry={geometry}
        routeRecords={visibleRoutes}
        spatialStates={visibleSpatialStates}
        terrainAsset={mapState.terrainAsset}
      />

      <aside className="detail-panel" aria-label="Selected record">
        {selected?.kind === 'battle' && visibleBattles.some((item) => item.id === selected.id) ? (
          <BattleDossier battle={dataset.battles.find((item) => item.id === selected.id) ?? battle} entities={dataset.entities} compact />
        ) : selected?.kind === 'entity' && visibleEntities.some((item) => item.id === selected.id) ? (
          dataset.entities.find((item) => item.id === selected.id)
            ? <EntityDossier entity={dataset.entities.find((item) => item.id === selected.id)!} compact />
            : <p>Selected entity is unavailable.</p>
        ) : selected?.kind === 'event' && visibleEvents.some((item) => item.id === selected.id) ? (
          dataset.events.find((item) => item.id === selected.id)
            ? <EventDossier event={dataset.events.find((item) => item.id === selected.id)!} compact />
            : <p>Selected event is unavailable.</p>
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
