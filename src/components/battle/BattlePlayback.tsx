import { useEffect } from 'react';
import { useBattlePlaybackStore } from '../../app/state/battlePlaybackStore';
import { useMapViewStore } from '../../app/state/mapViewStore';
import type { Battle } from '../../domain/types/lore';
import { applyVisualActions } from '../../lib/story/interpretVisualAction';

const noPhases: NonNullable<Battle['phases']> = [];

function reducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function BattlePlayback({ battle, autoplay = false, controls = true }: {
  battle: Battle;
  autoplay?: boolean;
  controls?: boolean;
}) {
  const phases = battle.phases ?? noPhases;
  const battleId = useBattlePlaybackStore((state) => state.battleId);
  const phaseIndex = useBattlePlaybackStore((state) => state.phaseIndex);
  const status = useBattlePlaybackStore((state) => state.status);
  const load = useBattlePlaybackStore((state) => state.load);
  const play = useBattlePlaybackStore((state) => state.play);
  const pause = useBattlePlaybackStore((state) => state.pause);
  const goToPhase = useBattlePlaybackStore((state) => state.goToPhase);
  const restart = useBattlePlaybackStore((state) => state.restart);
  const complete = useBattlePlaybackStore((state) => state.complete);
  const requestCamera = useMapViewStore((state) => state.requestCamera);
  const phase = phases[phaseIndex];

  useEffect(() => {
    load(battle.id);
    if (autoplay) {
      restart();
      if (reducedMotion()) complete(Math.max(0, phases.length - 1));
      else play();
    }
  }, [autoplay, battle.id, complete, load, phases.length, play, restart]);

  useEffect(() => {
    if (battleId !== battle.id || !phase || status === 'idle') return;
    const actions = phase.visualActions ?? [];
    applyVisualActions(actions);
    if (phase.camera) requestCamera(phase.camera);
  }, [battle.id, battleId, phase, phaseIndex, phases, requestCamera, status]);

  useEffect(() => {
    if (status !== 'playing' || !phase) return;
    const timer = window.setTimeout(() => {
      if (phaseIndex < phases.length - 1) {
        useBattlePlaybackStore.setState({ phaseIndex: phaseIndex + 1 });
      } else {
        complete(Math.max(0, phases.length - 1));
      }
    }, phase.durationMs ?? 1800);
    return () => window.clearTimeout(timer);
  }, [complete, phase, phaseIndex, phases.length, status]);

  if (!phase || phases.length === 0) return <p>No playback phases are recorded.</p>;
  const skipToResult = () => complete(phases.length - 1);
  const startPlayback = () => reducedMotion() ? skipToResult() : play();

  return (
    <section className="battle-playback" aria-labelledby="playback-title">
      <p className="eyebrow">Historical cartography · phase {phaseIndex + 1} of {phases.length}</p>
      <h3 id="playback-title">{status === 'complete' ? 'Documented result' : phase.title}</h3>
      <p aria-live="polite">{status === 'complete' ? battle.outcome.summary : phase.narration ?? phase.summary}</p>
      {controls && <div className="playback-controls" aria-label="Battle playback controls">
        {status === 'playing'
          ? <button type="button" onClick={pause}>Pause</button>
          : <button type="button" onClick={startPlayback}>Play</button>}
        <button type="button" disabled={phaseIndex === 0} onClick={() => goToPhase(phaseIndex - 1)}>Previous phase</button>
        <button type="button" disabled={phaseIndex >= phases.length - 1} onClick={() => goToPhase(phaseIndex + 1)}>Next phase</button>
        <button type="button" onClick={restart}>Restart</button>
        <button type="button" onClick={skipToResult}>Skip to result</button>
      </div>}
    </section>
  );
}
