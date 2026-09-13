import { describe, expect, it } from 'vitest';
import { loadDataset } from '../../src/lib/lore/loadDataset';
import { buildCausalAdjacency, traverseCausal } from '../../src/lib/graph/causalGraph';

describe('causal graph traversal', () => {
  it('finds immediate source-aware causes and consequences', () => {
    const adjacency = buildCausalAdjacency(loadDataset());
    expect(traverseCausal('atlas-conflict-placeholder', 'causes', adjacency).map((edge) => edge.id))
      .toEqual(['archive-approach-causes-conflict-placeholder']);
    expect(traverseCausal('atlas-conflict-placeholder', 'consequences', adjacency).map((edge) => edge.id))
      .toEqual(['archive-conflict-causes-aftermath-placeholder']);
  });
});
