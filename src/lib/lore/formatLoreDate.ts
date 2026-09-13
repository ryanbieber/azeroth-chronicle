import type { LoreDate } from '../../domain/types/lore';

export function formatLoreDate(date: LoreDate | undefined): string {
  if (!date) return 'Not recorded';
  if (date.label) return date.label;
  if (date.precision === 'exact') return String(date.year);
  if (date.precision === 'unknown') return 'Unknown';
  return 'Approximate date';
}
