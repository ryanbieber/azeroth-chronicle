import { Link, useParams } from 'react-router-dom';
import { EventDossier } from '../components/dossier/EventDossier';
import { staticLoreRepository } from '../domain/repositories/StaticLoreRepository';
import { NotFound } from './EraPage';
import { StoryReturnLink } from '../components/story/StoryReturnLink';

export function EventPage() {
  const { slug = '' } = useParams();
  const event = staticLoreRepository.findEventBySlug(slug);
  if (!event) return <NotFound />;
  return (
    <main className="document-page">
      <EventDossier event={event} />
      <StoryReturnLink eraId={event.eraId} />
      <Link className="primary-link" to={`/?era=${event.eraId}`}>
        Choose this era’s tour
      </Link>
    </main>
  );
}
