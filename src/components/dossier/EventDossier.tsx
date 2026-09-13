import { Link } from 'react-router-dom';
import type { LoreEvent } from '../../domain/types/lore';
import { CausalGraph } from '../graph/CausalGraph';
import { ProvenancePanel } from '../provenance/ProvenancePanel';

export function EventDossier({ event, compact = false }: { event: LoreEvent; compact?: boolean }) {
  return (
    <article className="dossier" aria-labelledby="event-title">
      <p className="eyebrow">Event dossier</p>
      <h2 id="event-title">{event.name}</h2>
      <p className="status-chip">{event.contentStatus}</p>
      <p>{event.summary}</p>
      {event.description && <p>{event.description}</p>}
      <dl className="dossier-grid">
        <div><dt>Era</dt><dd>{event.eraId}</dd></div>
        <div><dt>Sources</dt><dd>{event.sourceIds.length || 'None — placeholder only'}</dd></div>
      </dl>
      <CausalGraph recordId={event.id} />
      <ProvenancePanel subjectId={event.id} />
      {compact && <Link to={`/events/${event.slug}`}>Open permanent dossier</Link>}
    </article>
  );
}
