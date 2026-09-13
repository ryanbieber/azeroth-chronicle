import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import process from 'node:process';

const collectionDirectories = {
  worldspaces: 'worldspaces',
  mapStates: 'map-states',
  spatialStates: 'spatial-states',
  layers: 'layers',
  routes: 'routes',
  campaigns: 'campaigns',
  eras: 'eras',
  entities: 'entities',
  events: 'events',
  battles: 'battles',
  sources: 'sources',
  citations: 'citations',
  claims: 'claims',
  relationships: 'relationships',
};

async function recordsIn(directory) {
  const absolute = resolve('data', directory);
  let filenames;
  try {
    filenames = await readdir(absolute);
  } catch (error) {
    if (error && error.code === 'ENOENT') return [];
    throw error;
  }
  const jsonFiles = filenames.filter((name) => name.endsWith('.json')).sort();
  return Promise.all(jsonFiles.map(async (name) =>
    JSON.parse(await readFile(resolve(absolute, name), 'utf8'))));
}

const manifest = {};
for (const [collection, directory] of Object.entries(collectionDirectories)) {
  manifest[collection] = await recordsIn(directory);
}

const stories = await recordsIn('stories');
manifest.storyGuides = stories.map((story) => story.guide);
manifest.storyNodes = stories.flatMap((story) => story.nodes);

const output = resolve('src/generated/lore-manifest.json');
await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`);
const geometryDirectory = resolve('data/geometry');
const geometryFiles = (await readdir(geometryDirectory)).filter((name) => name.endsWith('.geojson')).sort();
const geometry = await Promise.all(geometryFiles.map(async (name) =>
  JSON.parse(await readFile(resolve(geometryDirectory, name), 'utf8'))));
await writeFile(resolve('src/generated/geometry-manifest.json'), `${JSON.stringify(geometry, null, 2)}\n`);
const erasById = new Map(manifest.eras.map((era) => [era.id, era]));
const searchRecords = [
  ...manifest.eras.map((record) => ({ ...record, recordType: 'era', eraId: record.id, path: `/eras/${record.slug}`, description: record.summary })),
  ...manifest.entities.map((record) => ({ ...record, recordType: 'entity', eraId: record.firstEraId, path: `/${record.type === 'faction' ? 'factions' : 'locations'}/${record.slug}`, description: record.shortDescription })),
  ...manifest.events.map((record) => ({ ...record, recordType: 'event', path: `/events/${record.slug}`, description: record.summary })),
  ...manifest.battles.map((record) => ({ ...record, recordType: 'battle', path: `/battles/${record.slug}`, description: record.summary })),
  ...manifest.campaigns.map((record) => ({ ...record, recordType: 'campaign', path: `/eras/${erasById.get(record.eraId)?.slug ?? record.eraId}`, description: record.summary })),
];
const searchIndex = searchRecords.map((record) => ({
  id: record.id,
  type: record.recordType,
  name: record.name,
  slug: record.slug,
  path: record.path,
  eraId: record.eraId,
  aliases: record.aliases ?? [],
  tags: record.tags ?? [],
  description: record.description,
  sourceIds: record.sourceIds ?? [],
  contentStatus: record.contentStatus,
}));
await writeFile(resolve('src/generated/search-index.json'), `${JSON.stringify(searchIndex, null, 2)}\n`);
const count = Object.values(manifest).reduce((total, records) => total + records.length, 0);
process.stdout.write(`Generated lore manifest with ${count} records, ${geometry.length} geometry collections, and ${searchIndex.length} search entries.\n`);
