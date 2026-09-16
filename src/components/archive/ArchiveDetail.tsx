import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ArchiveEntry } from '../../domain/types/archive';
import type { LoreDataset } from '../../domain/types/lore';
import { formatLoreDate } from '../../lib/lore/formatLoreDate';
import { recordName } from '../../lib/lore/recordLinks';
import { ProvenancePanel } from '../provenance/ProvenancePanel';

interface ArchiveDetailProps {
  entry: ArchiveEntry;
  dataset: LoreDataset;
  position: number;
  total: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

const assetUrl = (asset: string) => `${import.meta.env.BASE_URL}${asset}`;

export function ArchiveDetail({
  entry, dataset, position, total, onClose, onPrevious, onNext,
}: ArchiveDetailProps) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLElement>(null);
  const returnFocus = useRef<HTMLElement | null>(
    document.activeElement instanceof HTMLElement ? document.activeElement : null,
  );
  const imageMedia = entry.media.filter((item) => item.kind === 'image');
  const [selection, setSelection] = useState<{ entryId: string; asset: string }>();

  useEffect(() => {
    closeButton.current?.focus();
  }, [entry.id]);

  useEffect(() => {
    const returnFocusTarget = returnFocus.current;
    return () => returnFocusTarget?.focus();
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onPrevious();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        onNext();
      }
      if (event.key === 'Tab' && dialog.current) {
        const focusable = [...dialog.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )];
        const first = focusable[0];
        const last = focusable.at(-1);
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onNext, onPrevious]);

  const activeMedia = imageMedia.find((item) => (
    selection?.entryId === entry.id && item.asset === selection.asset
  )) ?? imageMedia[0];

  return (
    <div
      className="archive-detail-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section
        ref={dialog}
        className="archive-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-detail-title"
        aria-describedby="archive-detail-summary"
      >
        <header className="archive-detail-toolbar">
          <p><span>{position + 1}</span> / {total}</p>
          <div>
            <button type="button" onClick={onPrevious} aria-label="Previous archive record">←</button>
            <button type="button" onClick={onNext} aria-label="Next archive record">→</button>
            <button ref={closeButton} type="button" onClick={onClose} aria-label="Close archive record">×</button>
          </div>
        </header>

        <div className="archive-detail-layout">
          <div className={`archive-detail-media archive-detail-media-${activeMedia?.fit ?? 'contain'}`}>
            {activeMedia ? (
              <img src={assetUrl(activeMedia.asset)} alt={`Visual archive asset for ${entry.title}`} />
            ) : (
              <div className="archive-media-empty" aria-label="No dedicated illustration">
                <span aria-hidden="true">◇</span>
                <p>No dedicated illustration is currently attached to this record.</p>
              </div>
            )}
            {activeMedia && (
              <p className={activeMedia.contextual ? 'is-contextual' : undefined}>{activeMedia.label}</p>
            )}
            {imageMedia.length > 1 && (
              <div className="archive-media-choices" aria-label="Available visual assets">
                {imageMedia.map((media) => (
                  <button
                    className={media.asset === activeMedia?.asset ? 'is-active' : undefined}
                    key={media.asset}
                    type="button"
                    onClick={() => setSelection({ entryId: entry.id, asset: media.asset })}
                    aria-pressed={media.asset === activeMedia?.asset}
                  >
                    <img src={assetUrl(media.asset)} alt="" />
                    <span>{media.label}</span>
                  </button>
                ))}
              </div>
            )}
            {entry.media.some((item) => item.kind === 'model') && (
              <div className="archive-model-links">
                {entry.media.filter((item) => item.kind === 'model').map((media) => (
                  <a key={media.asset} href={assetUrl(media.asset)}>{media.label}</a>
                ))}
              </div>
            )}
          </div>

          <article className="archive-detail-copy">
            <p className="eyebrow">{entry.subtitle}</p>
            <h1 id="archive-detail-title">{entry.title}</h1>
            {entry.contentStatus && <p className="status-chip">{entry.contentStatus}</p>}
            <p className="archive-detail-lede" id="archive-detail-summary">{entry.summary}</p>
            <ArchiveRecordFacts entry={entry} dataset={dataset} />
            <div className="archive-detail-links">
              {entry.recordPath && <Link className="primary-link" to={entry.recordPath}>Open full dossier</Link>}
              {entry.atlasPath && <Link className="primary-link secondary-link" to={entry.atlasPath}>Open in atlas</Link>}
            </div>
            {entry.recordType !== 'mapState' && <ProvenancePanel subjectId={entry.recordId} />}
          </article>
        </div>
        <p className="archive-detail-hint">Use ← and → to browse · Escape to close</p>
      </section>
    </div>
  );
}

function ArchiveRecordFacts({ entry, dataset }: { entry: ArchiveEntry; dataset: LoreDataset }) {
  const eraNames = entry.eraIds.map((id) => dataset.eras.find((era) => era.id === id)?.name ?? id);

  if (entry.recordType === 'entity') {
    const entity = dataset.entities.find((item) => item.id === entry.recordId);
    if (!entity) return null;
    const states = dataset.spatialStates.filter((state) => state.entityId === entity.id);
    const battles = dataset.battles.filter((battle) => battle.participantEntityIds?.includes(entity.id));
    const events = dataset.events.filter((event) => event.participantEntityIds?.includes(entity.id));
    return (
      <>
        {entity.body && <p>{entity.body}</p>}
        <dl className="archive-facts">
          <div><dt>Record type</dt><dd>{entity.type}</dd></div>
          <div><dt>Known eras</dt><dd>{eraNames.join(', ') || 'Not bounded to one era'}</dd></div>
          <div><dt>Aliases</dt><dd>{entity.aliases?.join(', ') || 'None recorded'}</dd></div>
          <div><dt>Sources</dt><dd>{entity.sourceIds.length}</dd></div>
          <div><dt>Atlas states</dt><dd>{states.length || 'No exact placement asserted'}</dd></div>
          <div><dt>Chronicle appearances</dt><dd>{events.length} events · {battles.length} battles</dd></div>
        </dl>
        {entity.tags && entity.tags.length > 0 && (
          <ul className="archive-tags" aria-label="Record tags">
            {entity.tags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
        )}
      </>
    );
  }

  if (entry.recordType === 'battle') {
    const battle = dataset.battles.find((item) => item.id === entry.recordId);
    if (!battle) return null;
    return (
      <>
        {battle.description && <p>{battle.description}</p>}
        <dl className="archive-facts">
          <div><dt>Era</dt><dd>{eraNames.join(', ')}</dd></div>
          <div><dt>Date</dt><dd>{formatLoreDate(battle.date)}</dd></div>
          <div><dt>Importance</dt><dd>{battle.importance.replace('_', ' ')}</dd></div>
          <div><dt>Geography</dt><dd>{battle.geographicCertainty}</dd></div>
          <div><dt>Combatants</dt><dd>{battle.combatants.map((item) => recordName(item.factionId, dataset)).join(' · ')}</dd></div>
          <div><dt>Phases</dt><dd>{battle.phases?.length ?? 'Not phased'}</dd></div>
        </dl>
        <section className="archive-outcome"><h2>Outcome</h2><p>{battle.outcome.summary}</p></section>
      </>
    );
  }

  if (entry.recordType === 'event') {
    const event = dataset.events.find((item) => item.id === entry.recordId);
    if (!event) return null;
    return (
      <>
        {event.description && <p>{event.description}</p>}
        <dl className="archive-facts">
          <div><dt>Era</dt><dd>{eraNames.join(', ')}</dd></div>
          <div><dt>Date</dt><dd>{formatLoreDate(event.date)}</dd></div>
          <div><dt>Participants</dt><dd>{event.participantEntityIds?.map((id) => recordName(id, dataset)).join(', ') || 'Not recorded'}</dd></div>
          <div><dt>Locations</dt><dd>{event.locationIds?.map((id) => recordName(id, dataset)).join(', ') || 'Not asserted'}</dd></div>
          <div><dt>Known causes</dt><dd>{event.causedByEventIds?.length ?? 0}</dd></div>
          <div><dt>Known consequences</dt><dd>{event.causesEventIds?.length ?? 0}</dd></div>
        </dl>
      </>
    );
  }

  const mapState = dataset.mapStates.find((item) => item.id === entry.recordId);
  if (!mapState) return null;
  const worldspace = dataset.worldspaces.find((item) => item.id === mapState.worldspaceId);
  return (
    <>
      <dl className="archive-facts">
        <div><dt>Worldspace</dt><dd>{worldspace?.name ?? mapState.worldspaceId}</dd></div>
        <div><dt>Presentation</dt><dd>{mapState.presentation ?? 'terrain'}</dd></div>
        <div><dt>Used in</dt><dd>{eraNames.join(', ') || 'Supporting state'}</dd></div>
        <div><dt>Geometry features</dt><dd>{mapState.geometryIds.length}</dd></div>
        <div><dt>Terrain texture</dt><dd>{mapState.terrainTextureAsset ? 'Available' : 'None'}</dd></div>
        <div><dt>Height or model</dt><dd>{mapState.terrainHeightAsset || mapState.terrainAsset ? 'Available' : 'Not applicable'}</dd></div>
      </dl>
      {mapState.cartographyLabel && <p className="archive-cartography-label">{mapState.cartographyLabel}</p>}
      {mapState.interpretationNote && (
        <section className="archive-outcome"><h2>Interpretation note</h2><p>{mapState.interpretationNote}</p></section>
      )}
    </>
  );
}
