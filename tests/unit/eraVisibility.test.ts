import { describe, expect, it } from 'vitest';
import type { Era, LoreEntity } from '../../src/domain/types/lore';
import { entityVisibleInEra } from '../../src/lib/lore/eraVisibility';

const eras = [
  { id: 'first-era', order: 1 },
  { id: 'middle-era', order: 2 },
  { id: 'last-era', order: 3 },
] as Era[];

const entity = {
  id: 'test-entity',
  firstEraId: 'first-era',
  lastEraId: 'last-era',
} as LoreEntity;

describe('entity era visibility', () => {
  it('includes every era inside an entity lifespan', () => {
    expect(entityVisibleInEra(entity, 'first-era', eras)).toBe(true);
    expect(entityVisibleInEra(entity, 'middle-era', eras)).toBe(true);
    expect(entityVisibleInEra(entity, 'last-era', eras)).toBe(true);
  });

  it('rejects unknown eras and accepts undated entities', () => {
    expect(entityVisibleInEra(entity, 'missing-era', eras)).toBe(false);
    expect(entityVisibleInEra({ ...entity, firstEraId: undefined, lastEraId: undefined }, 'middle-era', eras)).toBe(true);
  });
});
