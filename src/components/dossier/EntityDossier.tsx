import { Link } from 'react-router-dom';
import type { LoreEntity } from '../../domain/types/lore';
import { ProvenancePanel } from '../provenance/ProvenancePanel';
import { staticLoreRepository } from '../../domain/repositories/StaticLoreRepository';

export function EntityDossier({ entity, compact = false }: { entity: LoreEntity; compact?: boolean }) {
  const dataset = staticLoreRepository.getDataset();
  const spatialStates = dataset.spatialStates.filter((state) => state.entityId === entity.id);
  const overviewFacts = dataset.claims.filter((claim) =>
    claim.subjectId === entity.id
    && claim.status === 'active'
    && (claim.confidence === 'explicit' || claim.confidence === 'strongly_supported')
    && typeof claim.value === 'string'
    && !/(map|geograph|placement|coordinate)/i.test(claim.predicate),
  );
  const relatedBattles = dataset.battles.filter((battle) => battle.participantEntityIds?.includes(entity.id));
  const relationalStates = spatialStates.filter((state) => state.placementKind === 'relational');
  const overviewAsset = entity.mapFigure?.asset ?? entity.mapVisual?.asset;

  if (compact) {
    return (
      <article className="dossier entity-overview" aria-labelledby="entity-title">
        {overviewAsset && (
          <img
            className="entity-overview-portrait"
            src={`${import.meta.env.BASE_URL}${overviewAsset}`}
            alt={`Visual representation of ${entity.name}`}
          />
        )}
        <p className="eyebrow">{entity.type} overview</p>
        <h2 id="entity-title">{entity.name}</h2>
        {entity.aliases && entity.aliases.length > 0 && <p className="entity-aliases">{entity.aliases.join(' · ')}</p>}
        <p className="entity-overview-lede">{entity.shortDescription}</p>
        {entity.body && <p>{entity.body}</p>}
        {overviewFacts.length > 0 && (
          <section className="entity-overview-section" aria-labelledby="known-in-era-title">
            <h3 id="known-in-era-title">Known in this era</h3>
            <ul>{overviewFacts.map((claim) => <li key={claim.id}>{String(claim.value)}</li>)}</ul>
          </section>
        )}
        {relatedBattles.length > 0 && (
          <section className="entity-overview-section" aria-labelledby="history-appearances-title">
            <h3 id="history-appearances-title">In this history</h3>
            <ul>{relatedBattles.map((battle) => (
              <li key={battle.id}><Link to={`/battles/${battle.slug}`}>{battle.name}</Link></li>
            ))}</ul>
          </section>
        )}
      </article>
    );
  }

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
          <dt>Atlas placement</dt>
          <dd>{relationalStates.length > 0
            ? 'Relational — not a geographic coordinate'
            : spatialStates.length > 0
              ? spatialStates.map((state) => state.geographicCertainty).join(', ')
              : 'No exact map placement asserted'}</dd>
        </div>
      </dl>
      {spatialStates.map((state) => state.editorNote && (
        <p key={state.id} className="provenance-note">{state.placementKind === 'relational' ? 'Cosmography note' : 'Cartography note'}: {state.editorNote}</p>
      ))}
      <ProvenancePanel subjectId={entity.id} />
    </article>
  );
}
