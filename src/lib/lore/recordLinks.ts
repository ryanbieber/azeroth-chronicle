import type { LoreDataset } from '../../domain/types/lore';

export function recordName(id: string, dataset: LoreDataset): string {
  const record = [...dataset.events, ...dataset.battles, ...dataset.entities, ...dataset.eras]
    .find((item) => item.id === id);
  return record?.name ?? id;
}

export function recordPath(id: string, dataset: LoreDataset): string | undefined {
  const battle = dataset.battles.find((item) => item.id === id);
  if (battle) return `/battles/${battle.slug}`;
  const event = dataset.events.find((item) => item.id === id);
  if (event) return `/events/${event.slug}`;
  const entity = dataset.entities.find((item) => item.id === id);
  if (entity) return `/${entity.type === 'faction' ? 'factions' : 'locations'}/${entity.slug}`;
  const era = dataset.eras.find((item) => item.id === id);
  return era ? `/eras/${era.slug}` : undefined;
}
