import { Link, useParams } from 'react-router-dom';
import { EventDossier } from '../components/dossier/EventDossier';
import { staticLoreRepository } from '../domain/repositories/StaticLoreRepository';
import { NotFound } from './EraPage';

export function EventPage() {
  const { slug = '' } = useParams();
  const event = staticLoreRepository.findEventBySlug(slug);
  if (!event) return <NotFound />;
  return (
    <main className="document-page">
      <EventDossier event={event} />
      <Link className="primary-link" to={`/map?era=${event.eraId}&selected=event:${event.slug}`}>
        Locate this event in the atlas
      </Link>
    </main>
  );
}
