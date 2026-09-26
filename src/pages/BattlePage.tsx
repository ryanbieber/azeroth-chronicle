import { Link, useParams } from 'react-router-dom';
import { BattleDossier } from '../components/dossier/BattleDossier';
import { staticLoreRepository } from '../domain/repositories/StaticLoreRepository';
import { NotFound } from './EraPage';
import { StoryReturnLink } from '../components/story/StoryReturnLink';

export function BattlePage() {
  const { slug = '' } = useParams();
  const battle = staticLoreRepository.findBattleBySlug(slug);
  const dataset = staticLoreRepository.getDataset();
  if (!battle) return <NotFound />;

  return (
    <main className="document-page">
      <BattleDossier battle={battle} entities={dataset.entities} />
      <StoryReturnLink eraId={battle.eraId} />
      <Link className="primary-link" to={`/?era=${battle.eraId}`}>
        Choose this era’s tour
      </Link>
    </main>
  );
}
