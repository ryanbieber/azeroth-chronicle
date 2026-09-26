import { staticLoreRepository } from '../../domain/repositories/StaticLoreRepository';
import { beginStoryGuide, endStoryGuide, enterStoryNode } from '../../lib/story/storyRuntime';
import { useStoryStore } from '../../app/state/storyStore';
import { useNarrationStore } from '../../app/state/narrationStore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEraStore } from '../../app/state/eraStore';

function narrationDurationMs(narration: string): number {
  const words = narration.trim().split(/\s+/).filter(Boolean).length;
  const spokenMs = (words / 82) * 60_000;
  return Math.min(90_000, Math.max(18_000, Math.round(spokenMs / 500) * 500 + 5_000));
}

export function StoryGuidePanel({ guideId, showLauncher = true, voiceControlsHost }: { guideId: string; showLauncher?: boolean; voiceControlsHost?: HTMLElement | null }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const fullTour = params.get('tour') === 'full';
  const selectedEraTour = params.get('tour') === 'era';
  const tourActive = fullTour || selectedEraTour;
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
  const autoStartedGuide = useRef<string | null>(null);
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
    if (!tourActive) {
      autoStartedGuide.current = null;
      return;
    }
    if (!guide || autoStartedGuide.current === guide.id) return;
    autoStartedGuide.current = guide.id;
    if (!node) beginStoryGuide(guide.id);
  }, [tourActive, guide, node]);

  const finish = useCallback(() => {
    if (!guide) return;
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
    navigate(`/?tour=era-complete&era=${guide.eraId}`);
  }, [fullTour, guide, navigate, setEra]);

  const durationMs = node?.durationMs ?? (node ? narrationDurationMs(node.narration) : 0);

  useEffect(() => {
    remainingMs.current = durationMs;
  }, [node?.id, durationMs, narrationEnabled]);

  useEffect(() => {
    if (!node || status !== 'playing') return;
    if (narrationEnabled && node.voiceover) return;
    const currentIndex = guide?.nodeIds.indexOf(node.id) ?? -1;
    const nextNodeId = guide?.nodeIds[currentIndex + 1];
    if (!nextNodeId && !tourActive) return;
    timerStartedAt.current = performance.now();
    const timer = window.setTimeout(() => {
      const nextNode = nextNodeId ? staticLoreRepository.findStoryNode(nextNodeId) : undefined;
      if (nextNode) enterStoryNode(nextNode);
      else finish();
    }, remainingMs.current);
    return () => {
      window.clearTimeout(timer);
      remainingMs.current = Math.max(0, remainingMs.current - (performance.now() - timerStartedAt.current));
    };
  }, [finish, tourActive, guide, narrationEnabled, node, status]);

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

  const voiceControl = (
    <div className="story-voiceover">
      <button type="button" aria-label={narrationEnabled ? 'Voice-over on' : 'Enable voice-over'}
        aria-pressed={narrationEnabled} aria-describedby="voiceover-description" onClick={toggleVoiceover}>
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
          {narrationEnabled ? <path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" /> : <path d="m16 9 5 6m0-6-5 6" />}
        </svg>
        <span>Voice {narrationEnabled ? 'on' : 'off'}</span>
      </button>
      <small id="voiceover-description">
        {audioStatus === 'awaiting' ? 'Playback blocked. Toggle voice off and on to retry. ' : ''}
        AI-generated narration · transcript remains visible
      </small>
    </div>
  );

  return (
    <section className="story-card" aria-live="polite">
      <p className="eyebrow">Guided history</p>
      <h2>{node.title}</h2>
      <p className="story-transcript" tabIndex={0} aria-label="Chapter transcript">{node.narration}</p>
      <div className="story-controls">
        {voiceoverAvailable && (voiceControlsHost ? createPortal(voiceControl, voiceControlsHost) : voiceControl)}
        {voiceoverAvailable && <audio
          ref={audioRef}
          src={voiceoverSrc}
          preload="metadata"
          onPlay={() => setAudioStatus('playing')}
          onPause={() => setAudioStatus('idle')}
          onEnded={() => {
            if (!narrationEnabled || status !== 'playing') return;
            if (next) activate(next);
            else if (tourActive) finish();
          }}
        />}
        <div className="story-playback">
          <button type="button" aria-pressed={status === 'paused'} onClick={status === 'playing' ? pause : play}>
            {status === 'playing' ? 'Pause tour' : 'Resume tour'}
          </button>
          <span>{status === 'playing' ? 'Playing' : 'Paused'}</span>
        </div>
        <div className="story-actions">
          <button type="button" disabled={!previous} onClick={() => previous && activate(previous)}>Previous</button>
          <button type="button" onClick={() => next ? activate(next) : finish()}>{next ? 'Next' : fullTour ? 'Continue the journey' : 'Finish this era'}</button>
        </div>
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
