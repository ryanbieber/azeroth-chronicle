import { Link, useParams } from 'react-router-dom';
import { staticLoreRepository } from '../domain/repositories/StaticLoreRepository';

export function EraPage() {
  const { slug = '' } = useParams();
  const era = staticLoreRepository.findEraBySlug(slug);
  if (!era) return <NotFound />;

  return (
    <main className="document-page">
      <p className="eyebrow">Era dossier · {era.contentStatus}</p>
      <h1>{era.name}</h1>
      <p className="lede">{era.summary}</p>
      <dl className="dossier-grid">
        <div><dt>Worldspace</dt><dd>{era.worldspaceId}</dd></div>
        <div><dt>Map state</dt><dd>{era.mapStateId}</dd></div>
        <div><dt>Default layers</dt><dd>{era.defaultLayerIds.join(', ')}</dd></div>
        <div><dt>Sources</dt><dd>{era.sourceIds.length || 'None — placeholder only'}</dd></div>
      </dl>
      <Link className="primary-link" to={`/map?era=${era.slug}`}>Open this era in the atlas</Link>
    </main>
  );
}

export function NotFound() {
  return (
    <main className="document-page">
      <p className="eyebrow">Archive error</p>
      <h1>Record not found</h1>
      <p>The requested record is not present in the validated static dataset.</p>
      <Link className="primary-link" to="/map?era=black-empire">Return to the atlas</Link>
    </main>
  );
}
