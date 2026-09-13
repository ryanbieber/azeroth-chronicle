import { loadDataset } from '../src/lib/lore/loadDataset';
import { validateDatasetReferences } from '../src/lib/lore/validateDataset';

const dataset = loadDataset();
const issues = validateDatasetReferences(dataset);

if (issues.length > 0) {
  for (const issue of issues) console.error(`${issue.code}: ${issue.path} — ${issue.message}`);
  process.exitCode = 1;
} else {
  const recordCount = Object.values(dataset).reduce((total, records) => total + records.length, 0);
  console.log(`Lore validation passed (${recordCount} structured records).`);
}
