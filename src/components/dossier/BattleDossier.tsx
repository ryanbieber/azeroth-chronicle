import { Link } from 'react-router-dom';
import type { Battle, LoreEntity } from '../../domain/types/lore';
import { BattlePlayback } from '../battle/BattlePlayback';
import { CausalGraph } from '../graph/CausalGraph';
import { ProvenancePanel } from '../provenance/ProvenancePanel';
import { staticLoreRepository } from '../../domain/repositories/StaticLoreRepository';
import { formatLoreDate } from '../../lib/lore/formatLoreDate';

interface BattleDossierProps {
  battle: Battle;
  entities: LoreEntity[];
  compact?: boolean;
}

export function BattleDossier({ battle, entities, compact = false }: BattleDossierProps) {
  const entityName = (id: string) => entities.find((entity) => entity.id === id)?.name ?? id;
  const dataset = staticLoreRepository.getDataset();
  const campaign = dataset.campaigns.find((item) => item.id === battle.campaignId);
  const era = dataset.eras.find((item) => item.id === battle.eraId);
  const certaintySymbol = { exact: '●', approximate: '◐', inferred: '△', unknown: '?' }[battle.geographicCertainty];

  return (
    <article className="dossier" aria-labelledby="battle-title">
      <p className="eyebrow">Battle dossier · {battle.importance.replace('_', ' ')}</p>
      <h2 id="battle-title">{battle.name}</h2>
      <p className="status-chip">
        {battle.contentStatus} · <span aria-label={`Geographic certainty: ${battle.geographicCertainty}`}>{certaintySymbol} geography {battle.geographicCertainty}</span>
      </p>
      <p>{battle.summary}</p>

      <dl className="dossier-grid">
        <div>
          <dt>Campaign · era</dt>
          <dd>{campaign?.name ?? 'No campaign recorded'} · {era?.name ?? battle.eraId}</dd>
        </div>
        <div>
          <dt>Date · location</dt>
          <dd>{formatLoreDate(battle.date)} · {battle.locationIds?.map(entityName).join(', ') || 'Location not recorded'}</dd>
        </div>
        <div>
          <dt>Combatants</dt>
          <dd>{battle.combatants.map((item) => {
            const commanders = item.commanderEntityIds?.map(entityName).join(', ');
            return `${entityName(item.factionId)} (${item.role})${commanders ? ` — ${commanders}` : ''}`;
          }).join(' vs ')}</dd>
        </div>
        <div>
          <dt>Result</dt>
          <dd>{battle.outcome.summary}</dd>
        </div>
      </dl>

      {battle.objectives && battle.objectives.length > 0 && (
        <section>
          <h3>Objectives</h3>
          <ul className="objective-list">
            {battle.objectives.map((objective, index) => (
              <li key={`${objective.factionId ?? 'shared'}-${index}`}>
                {objective.factionId && <strong>{entityName(objective.factionId)}: </strong>}{objective.summary}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!compact && battle.phases && (
        <section>
          <h3>Phases</h3>
          <ol className="phase-list">
            {battle.phases.map((phase) => (
              <li key={phase.id}>
                <strong>{phase.title}</strong>
                <span>{phase.summary}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {battle.phases && <BattlePlayback battle={battle} />}
      <CausalGraph recordId={battle.id} />
      <ProvenancePanel subjectId={battle.id} />

      <p className="provenance-note">
        This fixture is deliberately fictional. Replace it only with reviewed, cited source records.
      </p>
      {compact && <Link to={`/battles/${battle.slug}`}>Open permanent dossier</Link>}
    </article>
  );
}
