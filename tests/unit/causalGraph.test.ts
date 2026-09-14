import { describe, expect, it } from 'vitest';
import { loadDataset } from '../../src/lib/lore/loadDataset';
import { buildCausalAdjacency, traverseCausal } from '../../src/lib/graph/causalGraph';

describe('causal graph traversal', () => {
  it('finds immediate source-aware causes and consequences', () => {
    const adjacency = buildCausalAdjacency(loadDataset());
    expect(traverseCausal('elemental-assault-on-black-empire', 'causes', adjacency).map((edge) => edge.id))
      .toEqual(['black-empire-prompts-elemental-resistance']);
    expect(traverseCausal('elemental-assault-on-black-empire', 'consequences', adjacency).map((edge) => edge.id))
      .toEqual(['elemental-resistance-causes-black-empire-dominion']);
  });
});
