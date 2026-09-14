import { staticLoreRepository } from '../../domain/repositories/StaticLoreRepository';

export function ProvenancePanel({ subjectId }: { subjectId: string }) {
  const dataset = staticLoreRepository.getDataset();
  const claims = dataset.claims.filter((claim) => claim.subjectId === subjectId);
  const edges = dataset.relationships.filter((edge) => edge.fromId === subjectId || edge.toId === subjectId);
  const citationIds = new Set([
    ...claims.flatMap((claim) => claim.citationIds),
    ...edges.flatMap((edge) => edge.citationIds),
  ]);
  const citations = dataset.citations.filter((citation) => citationIds.has(citation.id));

  return (
    <section className="provenance" aria-labelledby={`provenance-${subjectId}`}>
      <h3 id={`provenance-${subjectId}`}>Claims and provenance</h3>
      {claims.length === 0 && citations.length === 0 ? (
        <p>No claim-level citations are attached to this {subjectId.includes('placeholder') ? 'placeholder' : 'record'}.</p>
      ) : (
        <>
          {claims.map((claim) => (
            <article key={claim.id} className="claim">
              <strong>{claim.predicate.replaceAll('-', ' ')}</strong>
              <span>{String(claim.value)}</span>
              <small>Status: {claim.status} · Confidence: {claim.confidence.replace('_', ' ')}</small>
              {claim.editorNote && <p>Editor note: {claim.editorNote}</p>}
            </article>
          ))}
          <ol className="citation-list">
            {citations.map((citation) => {
              const source = dataset.sources.find((item) => item.id === citation.sourceId);
              const pageLabel = citation.pageStart
                ? `pp. ${citation.pageStart}${citation.pageEnd && citation.pageEnd !== citation.pageStart ? `–${citation.pageEnd}` : ''}`
                : undefined;
              const location = [citation.chapter, citation.section, pageLabel].filter(Boolean).join(' · ');
              return (
                <li key={citation.id}>
                  <strong>{source?.title ?? citation.sourceId}</strong>
                  <span>{location || citation.questId || 'Citation location recorded'}</span>
                  {citation.note && <small>{citation.note}</small>}
                </li>
              );
            })}
          </ol>
        </>
      )}
    </section>
  );
}
