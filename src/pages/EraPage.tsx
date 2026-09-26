import { Link, useParams } from 'react-router-dom';
import { staticLoreRepository } from '../domain/repositories/StaticLoreRepository';
import { entityPath } from '../lib/lore/recordLinks';

export function EraPage() {
  const { slug = '' } = useParams();
  const era = staticLoreRepository.findEraBySlug(slug);
  if (!era) return <NotFound />;
  const dataset = staticLoreRepository.getDataset();
  const sources = dataset.sources.filter((source) => era.sourceIds.includes(source.id));
  const events = era.featuredEventIds.flatMap((id) => {
    const event = dataset.events.find((item) => item.id === id);
    return event ? [event] : [];
  });
  const battles = era.featuredBattleIds.flatMap((id) => {
    const battle = dataset.battles.find((item) => item.id === id);
    return battle ? [battle] : [];
  });
  const entities = staticLoreRepository.listEntitiesForEra(era.id);
  const guide = era.storyGuideId ? staticLoreRepository.findStoryGuide(era.storyGuideId) : undefined;

  return (
    <main className="document-page">
      <p className="eyebrow">Era dossier · {era.contentStatus}</p>
      <h1>{era.name}</h1>
      <p className="lede">{era.summary}</p>
      <dl className="dossier-grid">
        <div><dt>Worldspace</dt><dd>{era.worldspaceId}</dd></div>
        <div><dt>Map state</dt><dd>{era.mapStateId}</dd></div>
        <div><dt>Default layers</dt><dd>{era.defaultLayerIds.join(', ')}</dd></div>
        <div><dt>Sources</dt><dd>{sources.map((source) => source.title).join('; ') || 'No sources recorded'}</dd></div>
      </dl>
      {(events.length > 0 || battles.length > 0) && (
        <section className="era-record-section">
          <p className="eyebrow">Historical sequence</p>
          <h2>Events and conflicts</h2>
          <div className="era-record-grid">
            {events.map((event) => (
              <Link key={event.id} to={`/events/${event.slug}`}>
                <strong>{event.name}</strong>
                <span>{event.summary}</span>
              </Link>
            ))}
            {battles.map((battle) => (
              <Link key={battle.id} to={`/battles/${battle.slug}`}>
                <strong>{battle.name}</strong>
                <span>{battle.summary}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
      {entities.length > 0 && (
        <section className="era-record-section">
          <p className="eyebrow">Atlas index</p>
          <h2>People, powers, and places</h2>
          <div className="era-entity-links">
            {entities.map((entity) => <Link key={entity.id} to={entityPath(entity)}>{entity.name} <small>{entity.type}</small></Link>)}
          </div>
        </section>
      )}
      {guide && (
        <section className="era-record-section">
          <p className="eyebrow">Guided history · {guide.nodeIds.length} chapters</p>
          <h2>{guide.title}</h2>
          <p>{guide.description}</p>
        </section>
      )}
      <Link className="primary-link" to={`/?era=${era.slug}`}>Choose this era’s tour</Link>
    </main>
  );
}

export function NotFound() {
  return (
    <main className="document-page">
      <p className="eyebrow">Archive error</p>
      <h1>Record not found</h1>
      <p>The requested record is not present in the validated static dataset.</p>
      <Link className="primary-link" to="/">Choose a tour</Link>
    </main>
  );
}
