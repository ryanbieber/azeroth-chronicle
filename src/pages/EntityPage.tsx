import { Link, useParams } from 'react-router-dom';
import { EntityDossier } from '../components/dossier/EntityDossier';
import { staticLoreRepository } from '../domain/repositories/StaticLoreRepository';
import { NotFound } from './EraPage';
import { StoryReturnLink } from '../components/story/StoryReturnLink';

export function EntityPage() {
  const { slug = '' } = useParams();
  const entity = staticLoreRepository.findEntityBySlug(slug);
  if (!entity) return <NotFound />;
  const hasMapState = staticLoreRepository.getDataset().spatialStates.some((state) => state.entityId === entity.id);
  return (
    <main className="document-page">
      <EntityDossier entity={entity} />
      <StoryReturnLink eraId={entity.firstEraId ?? 'black-empire'} />
      <Link className="primary-link" to={`/map?era=${entity.firstEraId ?? 'black-empire'}&selected=entity:${entity.slug}`}>
        {hasMapState ? 'Locate this record in the atlas' : 'Return to this era in the atlas'}
      </Link>
    </main>
  );
}
