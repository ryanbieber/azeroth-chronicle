import generatedIndex from '../../generated/search-index.json';

export interface SearchEntry {
  id: string;
  type: 'era' | 'entity' | 'event' | 'battle' | 'campaign';
  name: string;
  slug: string;
  path: string;
  eraId?: string;
  aliases: string[];
  tags: string[];
  description: string;
  sourceIds: string[];
  contentStatus: 'placeholder' | 'research' | 'reviewed' | 'published';
}

export interface SearchOptions {
  eraId?: string;
  sourceIds?: string[];
  includeUnpublished?: boolean;
  limit?: number;
}

const index = generatedIndex as SearchEntry[];

function normalize(value: string): string[] {
  return value.toLocaleLowerCase().normalize('NFKD').replace(/[^a-z0-9\s-]/g, ' ').split(/[\s-]+/).filter(Boolean);
}

function fieldScore(tokens: string[], query: string[], weight: number): number {
  return query.reduce((score, term) => score + (tokens.some((token) => token.startsWith(term)) ? weight : 0), 0);
}

export function searchLore(query: string, options: SearchOptions = {}): SearchEntry[] {
  const queryTokens = normalize(query);
  if (queryTokens.length === 0) return [];
  const sourceFilter = new Set(options.sourceIds ?? []);

  return index
    .filter((entry) => options.includeUnpublished !== false || entry.contentStatus === 'published')
    .filter((entry) => !options.eraId || entry.eraId === options.eraId || entry.type === 'era')
    .filter((entry) => sourceFilter.size === 0 || entry.sourceIds.some((id) => sourceFilter.has(id)))
    .map((entry) => ({
      entry,
      score: fieldScore(normalize(entry.name), queryTokens, 8)
        + fieldScore(entry.aliases.flatMap(normalize), queryTokens, 6)
        + fieldScore(normalize(entry.type), queryTokens, 4)
        + fieldScore(entry.tags.flatMap(normalize), queryTokens, 3)
        + fieldScore(normalize(entry.description), queryTokens, 1),
    }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, options.limit ?? 12)
    .map((result) => result.entry);
}
