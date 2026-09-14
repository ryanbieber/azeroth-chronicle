import { describe, expect, it } from 'vitest';
import { loadDataset } from '../../src/lib/lore/loadDataset';
import { entityPath, recordPath } from '../../src/lib/lore/recordLinks';

describe('record links', () => {
  it('routes every entity kind to a permanent dossier namespace', () => {
    const data = loadDataset();

    expect(entityPath({ ...data.entities[0]!, type: 'character', slug: 'keeper' })).toBe('/characters/keeper');
    expect(entityPath({ ...data.entities[0]!, type: 'faction', slug: 'host' })).toBe('/factions/host');
    expect(entityPath({ ...data.entities[0]!, type: 'artifact', slug: 'relic' })).toBe('/artifacts/relic');
    expect(entityPath({ ...data.entities[0]!, type: 'location', slug: 'site' })).toBe('/locations/site');
    expect(entityPath({ ...data.entities[0]!, type: 'other', slug: 'concept' })).toBe('/records/concept');
  });

  it('resolves Era 1 people, powers, and places through the dataset', () => {
    const data = loadDataset();

    expect(recordPath('alakir', data)).toBe('/characters/alakir');
    expect(recordPath('old-gods', data)).toBe('/factions/old-gods');
    expect(recordPath('azeroth-world-soul', data)).toBe('/records/azeroth-world-soul');
    expect(recordPath('yshaarj-central-bastion', data)).toBe('/locations/yshaarj-central-bastion');
  });
});
