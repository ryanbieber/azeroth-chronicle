import { describe, expect, it } from 'vitest';
import { loadDataset } from '../../src/lib/lore/loadDataset';
import { parseAtlasUrl, serializeAtlasUrl } from '../../src/lib/map/atlasUrlState';

describe('atlas URL state', () => {
  const dataset = loadDataset();

  it('restores era, selected battle, and visible layers from a deep link', () => {
    const state = parseAtlasUrl(new URLSearchParams(
      'era=black-empire&selected=battle:atlas-conflict-placeholder&layers=regions,battles',
    ), dataset);
    expect(state.eraId).toBe('black-empire');
    expect(state.selection).toEqual({ kind: 'battle', id: 'atlas-conflict-placeholder' });
    expect(state.layers).toEqual({ regions: true, battles: true, locations: false, routes: false, labels: false });
  });

  it('serializes shareable state and supports legacy battle links', () => {
    const legacy = parseAtlasUrl(new URLSearchParams(
      'era=black-empire&battle=atlas-conflict-placeholder',
    ), dataset);
    expect(legacy.selection).toEqual({ kind: 'battle', id: 'atlas-conflict-placeholder' });
    expect(serializeAtlasUrl(legacy, dataset).toString()).toBe(
      'era=black-empire&selected=battle%3Aatlas-conflict-placeholder',
    );
  });
});
