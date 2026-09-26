import { Link, useParams } from 'react-router-dom';
import { EntityDossier } from '../components/dossier/EntityDossier';
import { staticLoreRepository } from '../domain/repositories/StaticLoreRepository';
import { NotFound } from './EraPage';
import { StoryReturnLink } from '../components/story/StoryReturnLink';

export function EntityPage() {
  const { slug = '' } = useParams();
  const entity = staticLoreRepository.findEntityBySlug(slug);
  if (!entity) return <NotFound />;
  return (
    <main className="document-page">
      <EntityDossier entity={entity} />
      <StoryReturnLink eraId={entity.firstEraId ?? 'black-empire'} />
      <Link className="primary-link" to={`/?era=${entity.firstEraId ?? 'black-empire'}`}>
        Choose this era’s tour
      </Link>
    </main>
  );
}
