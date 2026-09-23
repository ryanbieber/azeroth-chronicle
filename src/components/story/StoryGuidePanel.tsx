import { staticLoreRepository } from '../../domain/repositories/StaticLoreRepository';
import { beginStoryGuide, endStoryGuide, enterStoryNode } from '../../lib/story/storyRuntime';
import { useStoryStore } from '../../app/state/storyStore';
import { useNarrationStore } from '../../app/state/narrationStore';
import { useEffect, useRef, useState } from 'react';
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
  const activeGuideId = useStoryStore((state) => state.guideId);
  const activeNodeId = useStoryStore((state) => state.nodeId);
  const status = useStoryStore((state) => state.status);
  const play = useStoryStore((state) => state.play);
  const pause = useStoryStore((state) => state.pause);
  const narrationEnabled = useNarrationStore((state) => state.enabled);
  const setNarrationEnabled = useNarrationStore((state) => state.setEnabled);
  const audioRef = useRef<HTMLAudioElement>(null);
  const remainingMs = useRef(0);
  const timerStartedAt = useRef(0);
  const [audioStatus, setAudioStatus] = useState<'idle' | 'playing' | 'awaiting'>('idle');
  const node = activeGuideId === guide?.id && activeNodeId && guide.nodeIds.includes(activeNodeId)
    ? staticLoreRepository.findStoryNode(activeNodeId)
    : undefined;
  const voiceoverSrc = node?.voiceover
    ? `${import.meta.env.BASE_URL}${node.voiceover.assetPath}`
    : undefined;

  useEffect(() => {
    if (fullTour && guide && !node) beginStoryGuide(guide.id);
  }, [fullTour, guide, node]);

  const durationMs = node?.durationMs ?? (node ? narrationDurationMs(node.narration) : 0);

  useEffect(() => {
    remainingMs.current = durationMs;
  }, [node?.id, durationMs, narrationEnabled]);

  useEffect(() => {
    if (!node || status !== 'playing') return;
    if (narrationEnabled && node.voiceover) return;
    const currentIndex = guide?.nodeIds.indexOf(node.id) ?? -1;
    const nextNodeId = guide?.nodeIds[currentIndex + 1];
    if (!nextNodeId) return;
    timerStartedAt.current = performance.now();
    const timer = window.setTimeout(() => {
      const nextNode = staticLoreRepository.findStoryNode(nextNodeId);
      if (nextNode) enterStoryNode(nextNode);
    }, remainingMs.current);
    return () => {
      window.clearTimeout(timer);
      remainingMs.current = Math.max(0, remainingMs.current - (performance.now() - timerStartedAt.current));
    };
  }, [guide, narrationEnabled, node, status]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.load();
  }, [node?.id, voiceoverSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!narrationEnabled || !node?.voiceover || status !== 'playing') {
      audio.pause();
      return;
    }
    void audio.play()
      .then(() => setAudioStatus('playing'))
      .catch(() => setAudioStatus('awaiting'));
    return () => audio.pause();
  }, [narrationEnabled, node?.id, node?.voiceover, status]);

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
  const voiceoverAvailable = Boolean(node.voiceover && voiceoverSrc);
  const toggleVoiceover = () => {
    const audio = audioRef.current;
    if (narrationEnabled) {
      audio?.pause();
      if (audio) audio.currentTime = 0;
      setNarrationEnabled(false);
      setAudioStatus('idle');
      return;
    }
    setNarrationEnabled(true);
    if (audio && status === 'playing') {
      void audio.play()
        .then(() => setAudioStatus('playing'))
        .catch(() => setAudioStatus('awaiting'));
    }
  };
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
      {voiceoverAvailable && (
        <div className="story-voiceover">
          <button type="button" aria-pressed={narrationEnabled} onClick={toggleVoiceover}>
            {narrationEnabled ? 'Voice-over on' : 'Enable voice-over'}
          </button>
          <small>
            {audioStatus === 'awaiting' ? 'Press again to begin playback. ' : ''}
            AI-generated guide narration · transcript remains visible
          </small>
          <audio
            ref={audioRef}
            src={voiceoverSrc}
            preload="metadata"
            onPlay={() => setAudioStatus('playing')}
            onPause={() => setAudioStatus('idle')}
            onEnded={() => next && activate(next)}
          />
        </div>
      )}
      <div className="story-playback">
        <button type="button" aria-pressed={status === 'paused'} onClick={status === 'playing' ? pause : play}>
          {status === 'playing' ? 'Pause tour' : 'Resume tour'}
        </button>
        <span>{status === 'playing' ? 'Playing' : 'Paused'}</span>
      </div>
      <div className="story-actions">
        <button type="button" disabled={!previous} onClick={() => previous && activate(previous)}>Previous</button>
        <button type="button" onClick={() => next ? activate(next) : finish()}>{next ? 'Next' : fullTour ? 'Continue the chronicle' : 'Next'}</button>
      </div>
      <div className="story-timer" role="progressbar" aria-label="Time until next story point">
        <span
          key={`${node.id}-${narrationEnabled}`}
          className={narrationEnabled && node.voiceover ? 'is-audio-timed' : undefined}
          style={{ animationDuration: `${narrationEnabled && node.voiceover ? node.voiceover.durationMs : durationMs}ms`, animationPlayState: status === 'playing' ? 'running' : 'paused' }}
        />
      </div>
    </section>
  );
}
