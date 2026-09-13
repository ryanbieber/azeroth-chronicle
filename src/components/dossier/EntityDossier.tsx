import { Link } from 'react-router-dom';
import type { LoreEntity } from '../../domain/types/lore';
import { ProvenancePanel } from '../provenance/ProvenancePanel';

export function EntityDossier({ entity, compact = false }: { entity: LoreEntity; compact?: boolean }) {
  return (
    <article className="dossier" aria-labelledby="entity-title">
      <p className="eyebrow">{entity.type} dossier</p>
      <h2 id="entity-title">{entity.name}</h2>
      <p className="status-chip">{entity.contentStatus}</p>
      <p>{entity.shortDescription}</p>
      {entity.body && <p>{entity.body}</p>}
      <dl className="dossier-grid">
        <div><dt>Aliases</dt><dd>{entity.aliases?.join(', ') || 'None recorded'}</dd></div>
        <div><dt>Sources</dt><dd>{entity.sourceIds.length || 'None — placeholder only'}</dd></div>
      </dl>
      <ProvenancePanel subjectId={entity.id} />
      {compact && <Link to={`/${entity.type === 'faction' ? 'factions' : 'locations'}/${entity.slug}`}>Open permanent dossier</Link>}
    </article>
  );
}
