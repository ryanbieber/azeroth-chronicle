import { describe, expect, it } from 'vitest';
import { formatLoreDate } from '../../src/lib/lore/formatLoreDate';

describe('lore date formatting', () => {
  it('preserves explicit labels and represents unknown dates honestly', () => {
    expect(formatLoreDate({ precision: 'approximate', year: -100, label: 'Long before the recorded era' }))
      .toBe('Long before the recorded era');
    expect(formatLoreDate({ precision: 'unknown' })).toBe('Unknown');
    expect(formatLoreDate(undefined)).toBe('Not recorded');
  });
});
