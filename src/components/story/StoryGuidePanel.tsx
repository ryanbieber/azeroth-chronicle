import { staticLoreRepository } from '../../domain/repositories/StaticLoreRepository';
import { applyVisualActions } from '../../lib/story/interpretVisualAction';
import { useStoryStore } from '../../app/state/storyStore';
import { useMapViewStore } from '../../app/state/mapViewStore';
import { Link } from 'react-router-dom';

export function StoryGuidePanel({ guideId }: { guideId: string }) {
  const guide = staticLoreRepository.findStoryGuide(guideId);
  const activeNodeId = useStoryStore((state) => state.nodeId);
  const start = useStoryStore((state) => state.start);
  const goToNode = useStoryStore((state) => state.goToNode);
  const stop = useStoryStore((state) => state.stop);
  const rememberBranch = useStoryStore((state) => state.rememberBranch);
  const node = activeNodeId ? staticLoreRepository.findStoryNode(activeNodeId) : undefined;
  const requestCamera = useMapViewStore((state) => state.requestCamera);
  const skipCamera = useMapViewStore((state) => state.skipCamera);
  const cancelCamera = useMapViewStore((state) => state.cancelCamera);

  if (!guide) return null;

  const activate = (nodeId: string) => {
    const next = staticLoreRepository.findStoryNode(nodeId);
    if (!next) return;
    goToNode(next.id);
    applyVisualActions(next.visualActions ?? []);
    if (next.camera) requestCamera(next.camera);
  };

  if (!node) {
    return (
      <section className="story-card" aria-labelledby="story-title">
        <p className="eyebrow">Guided history</p>
        <h2 id="story-title">{guide.title}</h2>
        <p>{guide.description}</p>
        <button
          type="button"
          onClick={() => {
            const first = guide.nodeIds[0];
            if (first) {
              start(guide.id, first);
              const firstNode = staticLoreRepository.findStoryNode(first);
              applyVisualActions(firstNode?.visualActions ?? []);
              if (firstNode?.camera) requestCamera(firstNode.camera);
            }
          }}
        >
          Experience the era
        </button>
      </section>
    );
  }

  const currentIndex = guide.nodeIds.indexOf(node.id);
  const previous = currentIndex > 0 ? guide.nodeIds[currentIndex - 1] : undefined;
  const next = currentIndex < guide.nodeIds.length - 1 ? guide.nodeIds[currentIndex + 1] : undefined;

  return (
    <section className="story-card" aria-live="polite">
      <p className="eyebrow">Story {currentIndex + 1} of {guide.nodeIds.length}</p>
      <h2>{node.title}</h2>
      <p>{node.narration}</p>
      {node.optionalExploreEntityIds && node.optionalExploreEntityIds.length > 0 && (
        <div className="story-branches">
          <strong>Optional dossiers</strong>
          {node.optionalExploreEntityIds.map((id) => {
            const entity = staticLoreRepository.getDataset().entities.find((item) => item.id === id);
            if (!entity) return null;
            return (
              <Link
                key={entity.id}
                to={`/${entity.type === 'faction' ? 'factions' : 'locations'}/${entity.slug}`}
                onClick={rememberBranch}
              >
                Explore {entity.name}
              </Link>
            );
          })}
        </div>
      )}
      <div className="story-actions">
        <button type="button" disabled={!previous} onClick={() => previous && activate(previous)}>Previous</button>
        {node.camera && <button type="button" onClick={skipCamera}>Skip motion</button>}
        {next ? (
          <button type="button" onClick={() => activate(next)}>Next</button>
        ) : (
          <button type="button" onClick={() => { stop(); cancelCamera(); applyVisualActions([]); }}>Finish</button>
        )}
      </div>
    </section>
  );
}
