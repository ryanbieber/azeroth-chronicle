import { Link } from 'react-router-dom';
import type { Battle, LoreEntity } from '../../domain/types/lore';

interface BattleDossierProps {
  battle: Battle;
  entities: LoreEntity[];
  compact?: boolean;
}

export function BattleDossier({ battle, entities, compact = false }: BattleDossierProps) {
  const entityName = (id: string) => entities.find((entity) => entity.id === id)?.name ?? id;

  return (
    <article className="dossier" aria-labelledby="battle-title">
      <p className="eyebrow">Battle dossier · {battle.importance.replace('_', ' ')}</p>
      <h2 id="battle-title">{battle.name}</h2>
      <p className="status-chip">{battle.contentStatus} · geography {battle.geographicCertainty}</p>
      <p>{battle.summary}</p>

      <dl className="dossier-grid">
        <div>
          <dt>Combatants</dt>
          <dd>{battle.combatants.map((item) => entityName(item.factionId)).join(' vs ')}</dd>
        </div>
        <div>
          <dt>Result</dt>
          <dd>{battle.outcome.summary}</dd>
        </div>
      </dl>

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

      <p className="provenance-note">
        This fixture is deliberately fictional. Replace it only with reviewed, cited source records.
      </p>
      {compact && <Link to={`/battles/${battle.slug}`}>Open permanent dossier</Link>}
    </article>
  );
}
