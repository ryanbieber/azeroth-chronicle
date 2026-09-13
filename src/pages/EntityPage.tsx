import { Link, useParams } from 'react-router-dom';
import { EntityDossier } from '../components/dossier/EntityDossier';
import { staticLoreRepository } from '../domain/repositories/StaticLoreRepository';
import { NotFound } from './EraPage';
import { useStoryStore } from '../app/state/storyStore';

export function EntityPage() {
  const { slug = '' } = useParams();
  const entity = staticLoreRepository.findEntityBySlug(slug);
  const branchReturn = useStoryStore((state) => state.branchReturn);
  const resumeBranch = useStoryStore((state) => state.resumeBranch);
  if (!entity) return <NotFound />;
  return (
    <main className="document-page">
      <EntityDossier entity={entity} />
      {branchReturn && (
        <Link className="primary-link secondary-link" to={`/map?era=${entity.firstEraId ?? 'black-empire'}`} onClick={resumeBranch}>
          Return to guided history
        </Link>
      )}
      <Link className="primary-link" to={`/map?era=${entity.firstEraId ?? 'black-empire'}&selected=entity:${entity.slug}`}>
        Locate this record in the atlas
      </Link>
    </main>
  );
}
