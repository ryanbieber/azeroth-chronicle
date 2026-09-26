import { useEraStore } from '../app/state/eraStore';
import { MapViewport3D } from '../components/map/MapViewport3D';
import { StoryGuidePanel } from '../components/story/StoryGuidePanel';
import { staticLoreRepository } from '../domain/repositories/StaticLoreRepository';
import { adaptGeometry } from '../lib/map/geometryAdapter';
import { useAtlasUrlState } from '../lib/map/useAtlasUrlState';
import { useMapViewStore } from '../app/state/mapViewStore';
import { useSelectionStore } from '../app/state/selectionStore';
import { EntityDossier } from '../components/dossier/EntityDossier';
import { resolveEraMapState } from '../lib/map/resolveEraMapState';
import { useStoryStore } from '../app/state/storyStore';
import { endStoryGuide } from '../lib/story/storyRuntime';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function MapPage() {
  const [voiceControlsHost, setVoiceControlsHost] = useState<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const dataset = staticLoreRepository.getDataset();
  useAtlasUrlState(dataset);
  const eraId = useEraStore((state) => state.eraId);
  const era = dataset.eras.find((item) => item.id === eraId) ?? dataset.eras[0];
  const activeGuideId = useStoryStore((state) => state.guideId);
  const activeNodeId = useStoryStore((state) => state.nodeId);
  const immersive = Boolean(activeNodeId && activeGuideId === era?.storyGuideId);
  const requestedMapStateId = useMapViewStore((state) => state.mapStateId);
  const selection = useSelectionStore((state) => state.selection);
  const selectionOrigin = useSelectionStore((state) => state.selectionOrigin);
  const select = useSelectionStore((state) => state.select);
  const mapState = era ? resolveEraMapState(dataset, era, requestedMapStateId) : undefined;
  const worldspace = dataset.worldspaces.find((item) => item.id === mapState?.worldspaceId);
  const visibleBattles = staticLoreRepository.listBattlesForEra(era?.id ?? '')
    .filter((battle) => battle.worldspaceId === worldspace?.id);
  const visibleEntities = staticLoreRepository.listEntitiesForEra(era?.id ?? '');
  const visibleEntityIds = new Set(visibleEntities.map((item) => item.id));
  const visibleRouteIds = new Set(dataset.campaigns
    .filter((campaign) => campaign.eraId === era?.id)
    .flatMap((campaign) => campaign.routeIds ?? []));
  const visibleRoutes = dataset.routes.filter((route) => visibleRouteIds.has(route.id)
    && route.worldspaceId === worldspace?.id);
  const visibleSpatialStates = dataset.spatialStates.filter((state) => state.eraId === era?.id
    && visibleEntityIds.has(state.entityId)
    && state.worldspaceId === worldspace?.id);
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
    <main className={`atlas-layout${immersive ? ' is-story-active' : ''}`}>
      <section className="map-stage" aria-label="Atlas map workspace">
        {immersive && (
          <header className="story-world-header">
            <div><p className="eyebrow">Azerothium · Unofficial fan atlas</p><strong>{era.name}</strong></div>
            <div className="story-world-actions">
            <div ref={setVoiceControlsHost} />
            <button type="button" onClick={() => {
              navigate(`/map?era=${era.slug}`, { replace: true });
              endStoryGuide();
            }}>Return to atlas</button>
            </div>
          </header>
        )}
        <MapViewport3D
          immersive={immersive}
          battles={visibleBattles}
          entities={visibleEntities}
          fallbackDossierPath={`/eras/${era.slug}`}
          geometry={geometry}
          routeRecords={visibleRoutes}
          spatialStates={visibleSpatialStates}
          terrainAsset={mapState.terrainAsset}
          terrainTextureAsset={mapState.terrainTextureAsset}
          terrainHeightAsset={mapState.terrainHeightAsset}
          presentation={mapState.presentation}
          cartographyLabel={mapState.cartographyLabel}
        />
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
            <StoryGuidePanel guideId={era.storyGuideId} showLauncher={false} voiceControlsHost={voiceControlsHost} />
          </div>
        )}
        {selectedEntity && selectionOrigin !== 'story' && (
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
