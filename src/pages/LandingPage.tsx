import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useEraStore } from '../app/state/eraStore';
import { staticLoreRepository } from '../domain/repositories/StaticLoreRepository';
import { beginStoryGuide, endStoryGuide } from '../lib/story/storyRuntime';

const base = import.meta.env.BASE_URL;

const movingStills = [
  { className: 'landing-still-cosmos', src: `${base}textures/cosmos/cosmic-origins-map-research/cosmic-field.research.webp` },
  { className: 'landing-still-empire', src: `${base}textures/azeroth/black-empire-map-research/terrain-atlas.research.webp` },
  { className: 'landing-still-ordering', src: `${base}textures/azeroth/ordering-of-azeroth-map-research/terrain-atlas.research.webp` },
  { className: 'landing-still-draenor', src: `${base}textures/draenor/rise-of-the-horde-draenor-before-map-research/terrain-atlas.research.webp` },
  { className: 'landing-still-amanthul', src: `${base}images/characters/cosmic-origins/amanthul.research.webp` },
  { className: 'landing-still-ragnaros', src: `${base}images/characters/black-empire/ragnaros.research.webp` },
  { className: 'landing-still-yshaarj', src: `${base}images/characters/black-empire/yshaarj.research.webp` },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const setEra = useEraStore((state) => state.setEra);
  const eras = staticLoreRepository.listEras();
  const guidedEras = eras.filter((era) => era.storyGuideId);
  const firstEra = guidedEras[0];
  const [chosenEraId, setChosenEraId] = useState(() => guidedEras.find((era) => era.slug === params.get('era'))?.id ?? firstEra?.id ?? '');
  const tourComplete = params.get('tour') === 'complete';
  const eraComplete = params.get('tour') === 'era-complete';

  const beginTour = (eraId: string, mode: 'full' | 'era') => {
    const chosenEra = guidedEras.find((item) => item.id === eraId);
    if (!chosenEra?.storyGuideId) return;
    endStoryGuide();
    setEra(chosenEra.id);
    beginStoryGuide(chosenEra.storyGuideId);
    navigate(`/map?era=${chosenEra.slug}&tour=${mode}`);
  };

  return (
    <main className="landing-page">
      <div className="landing-montage" aria-hidden="true">
        {movingStills.map((still) => (
          <figure className={`landing-still ${still.className}`} key={still.className}>
            <img src={still.src} alt="" />
          </figure>
        ))}
      </div>
      <div className="landing-veil" aria-hidden="true" />
      <section className="landing-hero" aria-labelledby="landing-title">
        <p className="eyebrow">Step into the history of Azeroth</p>
        <h1 id="landing-title">The full history,<br />from the first light onward.</h1>
        <p className="landing-lede">
          Follow one continuous path through the powers, people, wars, and consequences that shaped the world.
          Your journey begins before Azeroth had a name and moves forward through every completed era.
        </p>
        {tourComplete && (
          <p className="landing-tour-complete" role="status">
            You have reached the edge of the known history. New eras will join this path as their research is completed.
          </p>
        )}
        {eraComplete && <p className="landing-tour-complete" role="status">That era’s story is complete. Choose another era or follow the full history.</p>}
        <div className="landing-actions">
          <button className="landing-tour-button" type="button" onClick={() => firstEra && beginTour(firstEra.id, 'full')} disabled={!firstEra}>
            <span>Full tour of the history</span>
            <small>{guidedEras.length} completed eras · begins with Cosmic Origins</small>
          </button>
          <div className="landing-era-choice">
            <label htmlFor="choose-era-tour">Choose an era to tour</label>
            <div>
              <select id="choose-era-tour" value={chosenEraId} onChange={(event) => setChosenEraId(event.target.value)}>
                {guidedEras.map((guidedEra) => <option key={guidedEra.id} value={guidedEra.id}>{guidedEra.name}</option>)}
              </select>
              <button type="button" onClick={() => beginTour(chosenEraId, 'era')} disabled={!chosenEraId}>Tour this era</button>
            </div>
          </div>
          <Link to="/archive">Browse the illustrated archive</Link>
        </div>
      </section>
      <div className="landing-era-thread" aria-label="Current guided history coverage">
        {guidedEras.map((era, index) => (
          <span key={era.id}><i /> {index === 0 ? 'First' : 'Then'} · {era.name}</span>
        ))}
        <span className="is-future"><i /> The journey continues</span>
      </div>
    </main>
  );
}
