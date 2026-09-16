import type { EntityId } from './lore';

export type ArchiveCategory =
  | 'all'
  | 'map'
  | 'character'
  | 'group'
  | 'place'
  | 'battle'
  | 'event'
  | 'artifact'
  | 'record';

export type ArchiveRecordType = 'mapState' | 'entity' | 'battle' | 'event';

export interface ArchiveMedia {
  asset: string;
  label: string;
  kind: 'image' | 'model';
  fit: 'contain' | 'cover';
  contextual?: boolean;
}

export interface ArchiveEntry {
  id: string;
  recordId: EntityId;
  recordType: ArchiveRecordType;
  category: Exclude<ArchiveCategory, 'all'>;
  title: string;
  subtitle: string;
  summary: string;
  eraIds: EntityId[];
  contentStatus?: 'placeholder' | 'research' | 'reviewed' | 'published';
  media: ArchiveMedia[];
  recordPath?: string;
  atlasPath?: string;
  searchText: string;
}
