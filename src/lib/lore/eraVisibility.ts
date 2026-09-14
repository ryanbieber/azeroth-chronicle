import type { Era, LoreEntity } from '../../domain/types/lore';

export function entityVisibleInEra(entity: LoreEntity, eraId: string, eras: Era[]): boolean {
  if (entity.featuredEraIds) return entity.featuredEraIds.includes(eraId);
  if (!entity.firstEraId && !entity.lastEraId) return true;

  const orderById = new Map(eras.map((era) => [era.id, era.order]));
  const targetOrder = orderById.get(eraId);
  if (targetOrder === undefined) return false;

  const firstOrder = entity.firstEraId ? orderById.get(entity.firstEraId) : undefined;
  const lastOrder = entity.lastEraId ? orderById.get(entity.lastEraId) : undefined;
  if (entity.firstEraId && firstOrder === undefined) return false;
  if (entity.lastEraId && lastOrder === undefined) return false;

  return (firstOrder === undefined || targetOrder >= firstOrder)
    && (lastOrder === undefined || targetOrder <= lastOrder);
}
