import { staticLoreRepository } from '../../domain/repositories/StaticLoreRepository';
import { interpretVisualAction } from '../../lib/story/interpretVisualAction';
import { useStoryStore } from '../../app/state/storyStore';

export function StoryGuidePanel({ guideId }: { guideId: string }) {
  const guide = staticLoreRepository.findStoryGuide(guideId);
  const activeNodeId = useStoryStore((state) => state.nodeId);
  const start = useStoryStore((state) => state.start);
  const goToNode = useStoryStore((state) => state.goToNode);
  const stop = useStoryStore((state) => state.stop);
  const node = activeNodeId ? staticLoreRepository.findStoryNode(activeNodeId) : undefined;

  if (!guide) return null;

  const activate = (nodeId: string) => {
    const next = staticLoreRepository.findStoryNode(nodeId);
    if (!next) return;
    goToNode(next.id);
    next.visualActions?.forEach((action) => interpretVisualAction(action));
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
              staticLoreRepository.findStoryNode(first)?.visualActions?.forEach((action) => interpretVisualAction(action));
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
      <div className="story-actions">
        <button type="button" disabled={!previous} onClick={() => previous && activate(previous)}>Previous</button>
        {next ? (
          <button type="button" onClick={() => activate(next)}>Next</button>
        ) : (
          <button type="button" onClick={stop}>Finish</button>
        )}
      </div>
    </section>
  );
}
