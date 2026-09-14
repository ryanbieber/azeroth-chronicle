import { Link } from 'react-router-dom';
import type { LoreEntity } from '../../domain/types/lore';
import { ProvenancePanel } from '../provenance/ProvenancePanel';
import { staticLoreRepository } from '../../domain/repositories/StaticLoreRepository';
import { entityPath } from '../../lib/lore/recordLinks';

export function EntityDossier({ entity, compact = false }: { entity: LoreEntity; compact?: boolean }) {
  const spatialStates = staticLoreRepository.getDataset().spatialStates.filter((state) => state.entityId === entity.id);
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
        <div>
          <dt>Mapped geography</dt>
          <dd>{spatialStates.length > 0 ? spatialStates.map((state) => state.geographicCertainty).join(', ') : 'No exact map placement asserted'}</dd>
        </div>
      </dl>
      {spatialStates.map((state) => state.editorNote && (
        <p key={state.id} className="provenance-note">Cartography note: {state.editorNote}</p>
      ))}
      <ProvenancePanel subjectId={entity.id} />
      {compact && <Link to={entityPath(entity)}>Open permanent dossier</Link>}
    </article>
  );
}
