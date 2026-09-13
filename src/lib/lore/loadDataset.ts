import worldspace from '../../../data/worldspaces/azeroth.placeholder.json';
import mapState from '../../../data/map-states/black-empire.placeholder.json';
import era from '../../../data/eras/black-empire.placeholder.json';
import expedition from '../../../data/entities/archive-expedition.placeholder.json';
import domain from '../../../data/entities/unnamed-domain.placeholder.json';
import battle from '../../../data/battles/atlas-conflict.placeholder.json';
import story from '../../../data/stories/black-empire-guide.placeholder.json';
import { loreDatasetSchema } from '../../domain/schemas/loreSchemas';
import type { LoreDataset } from '../../domain/types/lore';

const candidate = {
  worldspaces: [worldspace],
  mapStates: [mapState],
  eras: [era],
  entities: [expedition, domain],
  events: [],
  battles: [battle],
  sources: [],
  citations: [],
  claims: [],
  relationships: [],
  storyGuides: [story.guide],
  storyNodes: story.nodes,
};

export function loadDataset(): LoreDataset {
  return loreDatasetSchema.parse(candidate) as LoreDataset;
}
