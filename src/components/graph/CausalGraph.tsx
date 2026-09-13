import { Link } from 'react-router-dom';
import { staticLoreRepository } from '../../domain/repositories/StaticLoreRepository';
import { buildCausalAdjacency, traverseCausal } from '../../lib/graph/causalGraph';
import { recordName, recordPath } from '../../lib/lore/recordLinks';

export function CausalGraph({ recordId }: { recordId: string }) {
  const dataset = staticLoreRepository.getDataset();
  const adjacency = buildCausalAdjacency(dataset);
  const causes = traverseCausal(recordId, 'causes', adjacency);
  const consequences = traverseCausal(recordId, 'consequences', adjacency);

  if (causes.length === 0 && consequences.length === 0) return null;
  const edgeRecordId = (edge: (typeof causes)[number], side: 'cause' | 'consequence') => {
    if (side === 'cause') return edge.type === 'causes' ? edge.fromId : edge.toId;
    return edge.type === 'causes' ? edge.toId : edge.fromId;
  };

  return (
    <section className="causal-graph" aria-labelledby={`causal-${recordId}`}>
      <h3 id={`causal-${recordId}`}>Why this matters: causes and consequences</h3>
      <div className="causal-columns">
        <div><strong>Led to this</strong>{causes.map((edge) => {
          const id = edgeRecordId(edge, 'cause');
          const path = recordPath(id, dataset);
          return <p key={edge.id}>{path ? <Link to={path}>{recordName(id, dataset)}</Link> : recordName(id, dataset)}<small>{edge.confidence} · {edge.citationIds.length} citation</small></p>;
        })}</div>
        <div className="causal-current"><strong>This record</strong><span>{recordName(recordId, dataset)}</span></div>
        <div><strong>Changed next</strong>{consequences.map((edge) => {
          const id = edgeRecordId(edge, 'consequence');
          const path = recordPath(id, dataset);
          return <p key={edge.id}>{path ? <Link to={path}>{recordName(id, dataset)}</Link> : recordName(id, dataset)}<small>{edge.confidence} · {edge.citationIds.length} citation</small></p>;
        })}</div>
      </div>
    </section>
  );
}
