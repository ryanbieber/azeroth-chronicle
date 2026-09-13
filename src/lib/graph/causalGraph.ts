import type { LoreDataset, Relationship } from '../../domain/types/lore';

export interface CausalAdjacency {
  causes: Map<string, Relationship[]>;
  consequences: Map<string, Relationship[]>;
}

export function buildCausalAdjacency(dataset: LoreDataset): CausalAdjacency {
  const causes = new Map<string, Relationship[]>();
  const consequences = new Map<string, Relationship[]>();
  const append = (map: Map<string, Relationship[]>, id: string, edge: Relationship) =>
    map.set(id, [...(map.get(id) ?? []), edge]);

  for (const edge of dataset.relationships) {
    if (edge.type === 'causes') {
      append(consequences, edge.fromId, edge);
      append(causes, edge.toId, edge);
    } else if (edge.type === 'caused_by') {
      append(causes, edge.fromId, edge);
      append(consequences, edge.toId, edge);
    }
  }
  return { causes, consequences };
}

export function traverseCausal(
  startId: string,
  direction: keyof CausalAdjacency,
  adjacency: CausalAdjacency,
  maxDepth = 1,
): Relationship[] {
  const discovered: Relationship[] = [];
  const visited = new Set([startId]);
  let frontier = [startId];
  for (let depth = 0; depth < maxDepth && frontier.length > 0; depth += 1) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const edge of adjacency[direction].get(id) ?? []) {
        if (discovered.some((item) => item.id === edge.id)) continue;
        discovered.push(edge);
        const target = direction === 'causes'
          ? (edge.type === 'causes' ? edge.fromId : edge.toId)
          : (edge.type === 'causes' ? edge.toId : edge.fromId);
        if (!visited.has(target)) {
          visited.add(target);
          next.push(target);
        }
      }
    }
    frontier = next;
  }
  return discovered;
}
