import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArchiveDetail } from '../components/archive/ArchiveDetail';
import { staticLoreRepository } from '../domain/repositories/StaticLoreRepository';
import type { ArchiveCategory, ArchiveEntry } from '../domain/types/archive';
import { archiveCategoryLabels, filterArchiveEntries } from '../lib/lore/archiveLibrary';

const categories = Object.keys(archiveCategoryLabels) as ArchiveCategory[];
const assetUrl = (asset: string) => `${import.meta.env.BASE_URL}${asset}`;

function isCategory(value: string | null): value is ArchiveCategory {
  return Boolean(value && categories.includes(value as ArchiveCategory));
}

export function ArchiveGalleryPage() {
  const dataset = staticLoreRepository.getDataset();
  const entries = staticLoreRepository.listArchiveEntries();
  const [params, setParams] = useSearchParams();
  const categoryParam = params.get('category');
  const category: ArchiveCategory = isCategory(categoryParam) ? categoryParam : 'all';
  const query = params.get('q') ?? '';
  const visibleEntries = useMemo(
    () => filterArchiveEntries(entries, category, query),
    [category, entries, query],
  );
  const selectedEntry = entries.find((entry) => entry.id === params.get('entry'));
  const selectedIndex = selectedEntry ? visibleEntries.findIndex((entry) => entry.id === selectedEntry.id) : -1;
  const detailSequence = selectedIndex >= 0 ? visibleEntries : entries;
  const detailIndex = selectedEntry ? detailSequence.findIndex((entry) => entry.id === selectedEntry.id) : -1;

  const updateParams = (updates: Record<string, string | undefined>, replace = true) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next, { replace });
  };

  const moveSelection = (offset: number) => {
    if (detailSequence.length === 0) return;
    const index = detailIndex < 0 ? 0 : (detailIndex + offset + detailSequence.length) % detailSequence.length;
    updateParams({ entry: detailSequence[index]?.id }, true);
  };

  const categoryCount = (candidate: ArchiveCategory) => candidate === 'all'
    ? entries.length
    : entries.filter((entry) => entry.category === candidate).length;

  return (
    <main className="archive-library-page">
      <header className="archive-library-hero">
        <div>
          <p className="eyebrow">The illustrated archive</p>
          <h1>Explore the archive.</h1>
          <p>
            Browse maps, characters, places, battles, and events from across Azeroth’s history. Open a record for
            its artwork, lore, sources, and related entries.
          </p>
        </div>
        <dl aria-label="Archive library summary">
          <div><dt>{entries.length}</dt><dd>records</dd></div>
          <div><dt>{entries.filter((entry) => entry.media.some((media) => !media.contextual)).length}</dt><dd>dedicated assets</dd></div>
          <div><dt>{dataset.eras.length}</dt><dd>eras</dd></div>
        </dl>
      </header>

      <section className="archive-library-controls" aria-label="Filter the archive library">
        <label>
          <span>Search the collection</span>
          <input
            type="search"
            value={query}
            placeholder="Try Aman’Thul, Argus, or Icecrown…"
            onChange={(event) => updateParams({ q: event.target.value || undefined, entry: undefined })}
          />
        </label>
        <div className="archive-category-tabs" role="group" aria-label="Archive categories">
          {categories.map((candidate) => (
            <button
              className={category === candidate ? 'is-active' : undefined}
              key={candidate}
              type="button"
              aria-pressed={category === candidate}
              onClick={() => updateParams({ category: candidate === 'all' ? undefined : candidate, entry: undefined })}
            >
              <span>{archiveCategoryLabels[candidate]}</span>
              <small>{categoryCount(candidate)}</small>
            </button>
          ))}
        </div>
      </section>

      <div className="archive-library-result-line" role="status">
        <span>{visibleEntries.length} {visibleEntries.length === 1 ? 'record' : 'records'}</span>
        <span>{archiveCategoryLabels[category]}{query && ` matching “${query}”`}</span>
      </div>

      {visibleEntries.length > 0 ? (
        <section className="archive-gallery" aria-label="Archive records">
          {visibleEntries.map((entry) => (
            <ArchiveCard
              entry={entry}
              key={entry.id}
              eraNames={entry.eraIds.map((id) => dataset.eras.find((era) => era.id === id)?.name ?? id)}
              onOpen={() => updateParams({ entry: entry.id }, false)}
            />
          ))}
        </section>
      ) : (
        <section className="archive-library-empty">
          <span aria-hidden="true">◇</span>
          <h2>No records answer that search.</h2>
          <p>Try another name or return to the full collection.</p>
          <button type="button" onClick={() => setParams(new URLSearchParams(), { replace: true })}>Show every record</button>
        </section>
      )}

      {selectedEntry && (
        <ArchiveDetail
          entry={selectedEntry}
          dataset={dataset}
          position={Math.max(detailIndex, 0)}
          total={detailSequence.length}
          onClose={() => updateParams({ entry: undefined })}
          onPrevious={() => moveSelection(-1)}
          onNext={() => moveSelection(1)}
        />
      )}
    </main>
  );
}

function ArchiveCard({
  entry, eraNames, onOpen,
}: {
  entry: ArchiveEntry;
  eraNames: string[];
  onOpen: () => void;
}) {
  const primaryMedia = entry.media.find((media) => media.kind === 'image');
  return (
    <button className="archive-card" type="button" onClick={onOpen} aria-label={`Open ${entry.title}`}>
      <span className={`archive-card-media archive-card-media-${primaryMedia?.fit ?? 'contain'}`}>
        {primaryMedia ? (
          <img loading="lazy" src={assetUrl(primaryMedia.asset)} alt="" />
        ) : (
          <span className="archive-card-sigil" aria-hidden="true">◇</span>
        )}
        <span className="archive-card-kind">{archiveCategoryLabels[entry.category]}</span>
        {primaryMedia?.contextual && <span className="archive-card-context">Context map</span>}
      </span>
      <span className="archive-card-copy">
        <strong>{entry.title}</strong>
        <span>{entry.subtitle}</span>
        <small>{eraNames.slice(0, 2).join(' · ') || 'Archive-wide record'}</small>
      </span>
    </button>
  );
}
