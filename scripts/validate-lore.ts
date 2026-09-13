import { loadDataset } from '../src/lib/lore/loadDataset';
import { validateDatasetReferences } from '../src/lib/lore/validateDataset';
import { geometryIds, loadGeometry } from '../src/lib/lore/loadGeometry';
import { validateGeometry } from '../src/lib/map/geometryAdapter';

const dataset = loadDataset();
const issues = validateDatasetReferences(dataset, { geometryIds: geometryIds() });

for (const mapState of dataset.mapStates) {
  const worldspace = dataset.worldspaces.find((item) => item.id === mapState.worldspaceId);
  if (!worldspace) continue;
  for (const geometryId of mapState.geometryIds) {
    const collection = loadGeometry(geometryId);
    if (!collection) continue;
    for (const issue of validateGeometry(collection, worldspace.coordinateSystem)) {
      issues.push({ code: 'broken-reference', path: issue.featureId, message: issue.message });
    }
  }
}

if (issues.length > 0) {
  for (const issue of issues) console.error(`${issue.code}: ${issue.path} — ${issue.message}`);
  process.exitCode = 1;
} else {
  const recordCount = Object.values(dataset).reduce((total, records) => total + records.length, 0);
  console.log(`Lore validation passed (${recordCount} structured records).`);
}
