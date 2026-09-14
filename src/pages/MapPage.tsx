import { useEraStore } from '../app/state/eraStore';
import { MapViewport3D } from '../components/map/MapViewport3D';
import { StoryGuidePanel } from '../components/story/StoryGuidePanel';
import { staticLoreRepository } from '../domain/repositories/StaticLoreRepository';
import { adaptGeometry } from '../lib/map/geometryAdapter';
import { useAtlasUrlState } from '../lib/map/useAtlasUrlState';
import { useMapViewStore } from '../app/state/mapViewStore';
import { useSelectionStore } from '../app/state/selectionStore';
import { useStoryStore } from '../app/state/storyStore';
import { EntityDossier } from '../components/dossier/EntityDossier';

export function MapPage() {
  const dataset = staticLoreRepository.getDataset();
  useAtlasUrlState(dataset);
  const eraId = useEraStore((state) => state.eraId);
  const era = dataset.eras.find((item) => item.id === eraId) ?? dataset.eras[0];
  const requestedMapStateId = useMapViewStore((state) => state.mapStateId);
  const selection = useSelectionStore((state) => state.selection);
  const select = useSelectionStore((state) => state.select);
  const activeGuideId = useStoryStore((state) => state.guideId);
  const mapState = dataset.mapStates.find((item) => item.id === requestedMapStateId && item.worldspaceId === era?.worldspaceId)
    ?? dataset.mapStates.find((item) => item.id === era?.mapStateId);
  const worldspace = dataset.worldspaces.find((item) => item.id === era?.worldspaceId);
  const visibleBattles = staticLoreRepository.listBattlesForEra(era?.id ?? '');
  const visibleEntities = staticLoreRepository.listEntitiesForEra(era?.id ?? '');
  const visibleEntityIds = new Set(visibleEntities.map((item) => item.id));
  const visibleRouteIds = new Set(dataset.campaigns
    .filter((campaign) => campaign.eraId === era?.id)
    .flatMap((campaign) => campaign.routeIds ?? []));
  const visibleRoutes = dataset.routes.filter((route) => visibleRouteIds.has(route.id));
  const visibleSpatialStates = dataset.spatialStates.filter((state) => state.eraId === era?.id
    && visibleEntityIds.has(state.entityId));
  const selectedEntity = selection?.kind === 'entity'
    ? visibleEntities.find((entity) => entity.id === selection.id)
    : undefined;

  if (!era || !mapState || !worldspace) {
    return <main className="empty-state">No validated era fixture is available.</main>;
  }

  const permittedGeometryIds = new Set([
    ...visibleRoutes.map((route) => route.geometryId),
    ...visibleSpatialStates.flatMap((state) => state.geometryId ? [state.geometryId] : []),
    ...visibleBattles.flatMap((item) => item.geometryId ? [item.geometryId] : []),
  ]);
  const activeGeometryIds = new Set([...mapState.geometryIds, ...permittedGeometryIds]);
  const features = [...activeGeometryIds].flatMap((id) =>
    staticLoreRepository.getGeometry(id)?.features.filter((feature) => feature.id === id) ?? []);
  const allGeometry = adaptGeometry(
    { type: 'FeatureCollection', features },
    worldspace.coordinateSystem,
    10,
    mapState.terrainTextureAsset ? 6.67 : 10,
  );
  const geometry = allGeometry;

  return (
    <main className="atlas-layout">
      <section className="map-stage" aria-label="Atlas map workspace">
        <MapViewport3D
          battles={visibleBattles}
          entities={visibleEntities}
          fallbackDossierPath={`/eras/${era.slug}`}
          geometry={geometry}
          routeRecords={visibleRoutes}
          spatialStates={visibleSpatialStates}
          terrainAsset={mapState.terrainAsset}
          terrainTextureAsset={mapState.terrainTextureAsset}
          terrainHeightAsset={mapState.terrainHeightAsset}
          cartographyLabel={era.id === 'black-empire' ? 'INTERPRETIVE CARTOGRAPHY' : 'ATLAS CARTOGRAPHY'}
        />
        {era.id === 'black-empire' && (
          <section className="map-legend" aria-label="Map key">
            <details>
              <summary>Cartographer’s notes</summary>
              <div className="map-legend-entries">
                <span><i className="legend-swatch influence" /> Reconstructed influence</span>
                <span><i className="legend-presence" /> Narrated power</span>
                <span><i className="legend-marker" /> Source-located site</span>
                <span><i className="legend-unknown">?</i> Unplaced conflict</span>
              </div>
              <p>Dashed forms are interpretive. Open a dossier for the source and certainty note.</p>
            </details>
          </section>
        )}
        {mapState.geometryIds.length === 0
          && visibleBattles.length === 0
          && visibleSpatialStates.length === 0 && (
          <section className="map-research-state" aria-live="polite">
            <p className="eyebrow">Cartography research queued</p>
            <h2>{era.name}</h2>
            <p>The era is selectable now. Its terrain, people, places, conflicts, and guided story will be added through the reviewed era build plan.</p>
          </section>
        )}
        {era.storyGuideId && (
          <div className="story-overlay">
            <StoryGuidePanel guideId={era.storyGuideId} showLauncher={false} />
          </div>
        )}
        {selectedEntity && !activeGuideId && (
          <aside className="selection-overlay" aria-label="Selected atlas record">
            <button className="selection-close" type="button" onClick={() => select(null)} aria-label="Close dossier">×</button>
            <EntityDossier entity={selectedEntity} compact />
          </aside>
        )}
      </section>

      <div className="timeline" aria-label="Era timeline">
        <span className="timeline-dot" />
        <strong>{era.name}</strong>
        <span>{era.dateLabel}</span>
      </div>
    </main>
  );
}
