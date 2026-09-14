import { staticLoreRepository } from '../../domain/repositories/StaticLoreRepository';
import { beginStoryGuide, endStoryGuide, enterStoryNode } from '../../lib/story/storyRuntime';
import { useStoryStore } from '../../app/state/storyStore';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEraStore } from '../../app/state/eraStore';

function narrationDurationMs(narration: string): number {
  const words = narration.trim().split(/\s+/).filter(Boolean).length;
  const spokenMs = (words / 82) * 60_000;
  return Math.min(90_000, Math.max(18_000, Math.round(spokenMs / 500) * 500 + 5_000));
}

export function StoryGuidePanel({ guideId, showLauncher = true }: { guideId: string; showLauncher?: boolean }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const fullTour = params.get('tour') === 'full';
  const setEra = useEraStore((state) => state.setEra);
  const guide = staticLoreRepository.findStoryGuide(guideId);
  const activeNodeId = useStoryStore((state) => state.nodeId);
  const status = useStoryStore((state) => state.status);
  const play = useStoryStore((state) => state.play);
  const node = activeNodeId ? staticLoreRepository.findStoryNode(activeNodeId) : undefined;

  useEffect(() => {
    if (fullTour && guide && !node) beginStoryGuide(guide.id);
  }, [fullTour, guide, node]);

  useEffect(() => {
    if (node && status === 'paused') play();
  }, [node, play, status]);

  useEffect(() => {
    if (!node || status !== 'playing') return;
    const currentIndex = guide?.nodeIds.indexOf(node.id) ?? -1;
    const nextNodeId = guide?.nodeIds[currentIndex + 1];
    if (!nextNodeId) return;
    const timer = window.setTimeout(() => {
      const nextNode = staticLoreRepository.findStoryNode(nextNodeId);
      if (nextNode) enterStoryNode(nextNode);
    }, node.durationMs ?? narrationDurationMs(node.narration));
    return () => window.clearTimeout(timer);
  }, [guide, node, status]);

  if (!guide) return null;

  const activate = (nodeId: string) => {
    const next = staticLoreRepository.findStoryNode(nodeId);
    if (!next) return;
    enterStoryNode(next);
  };

  if (!node) {
    if (!showLauncher) return null;
    return (
      <section className="story-card" aria-labelledby="story-title">
        <p className="eyebrow">Guided history</p>
        <h2 id="story-title">{guide.title}</h2>
        <p>{guide.description}</p>
        <button
          type="button"
          onClick={() => beginStoryGuide(guide.id)}
        >
          Experience the era
        </button>
      </section>
    );
  }

  const currentIndex = guide.nodeIds.indexOf(node.id);
  const previous = currentIndex > 0 ? guide.nodeIds[currentIndex - 1] : undefined;
  const next = currentIndex < guide.nodeIds.length - 1 ? guide.nodeIds[currentIndex + 1] : undefined;
  const durationMs = node.durationMs ?? narrationDurationMs(node.narration);
  const finish = () => {
    if (fullTour) {
      const eras = staticLoreRepository.listEras();
      const currentEraIndex = eras.findIndex((era) => era.id === guide.eraId);
      const nextGuidedEra = eras.slice(currentEraIndex + 1).find((era) => era.storyGuideId);
      if (nextGuidedEra?.storyGuideId) {
        endStoryGuide();
        setEra(nextGuidedEra.id);
        beginStoryGuide(nextGuidedEra.storyGuideId);
        navigate(`/map?era=${nextGuidedEra.slug}&tour=full`);
        return;
      }
      endStoryGuide();
      navigate('/?tour=complete');
      return;
    }
    endStoryGuide();
  };

  return (
    <section className="story-card" aria-live="polite">
      <p className="eyebrow">Guided chronicle</p>
      <h2>{node.title}</h2>
      <p>{node.narration}</p>
      <div className="story-actions">
        <button type="button" disabled={!previous} onClick={() => previous && activate(previous)}>Previous</button>
        <button type="button" onClick={() => next ? activate(next) : finish()}>{next ? 'Next' : fullTour ? 'Continue the chronicle' : 'Next'}</button>
      </div>
      <div className="story-timer" role="progressbar" aria-label="Time until next story point">
        <span key={node.id} style={{ animationDuration: `${durationMs}ms` }} />
      </div>
    </section>
  );
}
