import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelectionStore, type Selection } from '../../app/state/selectionStore';
import { useSourceFilterStore } from '../../app/state/sourceFilterStore';
import { staticLoreRepository } from '../../domain/repositories/StaticLoreRepository';

function selectionFor(type: string, id: string): Selection {
  if (type === 'battle' || type === 'event' || type === 'entity') return { kind: type, id };
  return null;
}

export function ArchiveSearch({ eraId }: { eraId: string }) {
  const [query, setQuery] = useState('');
  const select = useSelectionStore((state) => state.select);
  const sourceIds = useSourceFilterStore((state) => state.sourceIds);
  const results = staticLoreRepository.search(query, { eraId, sourceIds, includeUnpublished: true, limit: 8 });

  return (
    <section className="archive-search" aria-label="Search archive">
      <label className="search-field">
        <span>Search archive</span>
        <input
          type="search"
          value={query}
          placeholder="Names, types, and descriptions"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      {query && results.length === 0 && <p className="search-empty" role="status">No matching records in this era.</p>}
      {results.length > 0 && (
        <ul className="search-results">
          {results.map((result) => {
            const selection = selectionFor(result.type, result.id);
            return (
              <li key={result.id}>
                <div><strong>{result.name}</strong><span>{result.type} · {result.contentStatus}</span></div>
                <div>
                  {selection && <button type="button" onClick={() => select(selection)}>Show</button>}
                  <Link to={result.path}>Dossier</Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
