import { describe, expect, it } from 'vitest';
import { loadDataset } from '../../src/lib/lore/loadDataset';
import { parseAtlasUrl, serializeAtlasUrl } from '../../src/lib/map/atlasUrlState';

describe('atlas URL state', () => {
  const dataset = loadDataset();

  it('restores era and selection while ignoring visitor layer overrides', () => {
    const state = parseAtlasUrl(new URLSearchParams(
      'era=black-empire&selected=battle:elemental-assault-on-black-empire&layers=regions,battles',
    ), dataset);
    expect(state.eraId).toBe('black-empire');
    expect(state.selection).toEqual({ kind: 'battle', id: 'elemental-assault-on-black-empire' });
    expect(state.layers).toEqual({ regions: true, battles: true, locations: true, routes: true, labels: true });
  });

  it('serializes shareable state and supports legacy battle links', () => {
    const legacy = parseAtlasUrl(new URLSearchParams(
      'era=black-empire&battle=elemental-assault-on-black-empire',
    ), dataset);
    expect(legacy.selection).toEqual({ kind: 'battle', id: 'elemental-assault-on-black-empire' });
    expect(serializeAtlasUrl(legacy, dataset).toString()).toBe(
      'era=black-empire&selected=battle%3Aelemental-assault-on-black-empire',
    );
  });
});
