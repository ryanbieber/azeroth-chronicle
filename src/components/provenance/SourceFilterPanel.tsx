import { useSourceFilterStore } from '../../app/state/sourceFilterStore';
import { staticLoreRepository } from '../../domain/repositories/StaticLoreRepository';

export function SourceFilterPanel() {
  const selected = useSourceFilterStore((state) => state.sourceIds);
  const setSourceIds = useSourceFilterStore((state) => state.setSourceIds);
  const sources = staticLoreRepository.getDataset().sources;
  if (sources.length === 0) return null;

  const toggle = (id: string) => setSourceIds(selected.includes(id)
    ? selected.filter((item) => item !== id)
    : [...selected, id]);
  return (
    <section className="source-filters" aria-labelledby="source-filter-title">
      <h2 id="source-filter-title">Source filters</h2>
      {sources.map((source) => (
        <label key={source.id}>
          <input type="checkbox" checked={selected.includes(source.id)} onChange={() => toggle(source.id)} />
          <span>{source.title}</span>
        </label>
      ))}
      {selected.length > 0 && <button type="button" onClick={() => setSourceIds([])}>Clear source filters</button>}
    </section>
  );
}
