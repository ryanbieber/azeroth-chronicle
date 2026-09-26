import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  const tourComplete = params.get('tour') === 'complete';

  const beginFullTour = () => {
    if (!firstEra?.storyGuideId) return;
    endStoryGuide();
    setEra(firstEra.id);
    beginStoryGuide(firstEra.storyGuideId);
    navigate(`/map?era=${firstEra.slug}&tour=full`);
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
        <div className="landing-actions">
          <button className="landing-tour-button" type="button" onClick={beginFullTour} disabled={!firstEra}>
            <span>Full tour of the history</span>
            <small>{guidedEras.length} completed eras · begins with Cosmic Origins</small>
          </button>
          <Link to="/map?era=cosmic-origins">Explore the atlas freely</Link>
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
