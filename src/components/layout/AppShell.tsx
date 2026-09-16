import type { ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEraStore } from '../../app/state/eraStore';
import { staticLoreRepository } from '../../domain/repositories/StaticLoreRepository';
import { beginStoryGuide, endStoryGuide } from '../../lib/story/storyRuntime';

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const landing = location.pathname === '/';
  const eras = staticLoreRepository.listEras();
  const eraId = useEraStore((state) => state.eraId);
  const setEra = useEraStore((state) => state.setEra);
  const selectedEra = eras.find((era) => era.id === eraId) ?? eras[0];

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink className="brand" to="/">
          <span className="brand-mark">AC</span>
          <span>
            <strong>Azeroth Chronicle</strong>
            <small>Unofficial fan atlas</small>
          </span>
        </NavLink>
        {!landing && <div className="topbar-actions">
          {eras.length > 0 && (
            <label className="top-era-selector">
              <span>Era</span>
              <select
                aria-label="Choose era"
                value={selectedEra?.id}
                onChange={(event) => {
                  const era = eras.find((item) => item.id === event.target.value);
                  if (!era) return;
                  endStoryGuide();
                  setEra(era.id);
                  navigate(`/map?era=${era.slug}`);
                }}
              >
                {eras.map((era) => <option key={era.id} value={era.id}>{era.name}</option>)}
              </select>
            </label>
          )}
          {selectedEra?.storyGuideId && (
            <button
              className="top-tour-button"
              type="button"
              onClick={() => {
                if (beginStoryGuide(selectedEra.storyGuideId!)) navigate(`/map?era=${selectedEra.slug}`);
              }}
            >
              Guided tour
            </button>
          )}
          <nav aria-label="Primary navigation">
            <NavLink to={`/map?era=${selectedEra?.slug ?? 'black-empire'}`}>Atlas</NavLink>
            <NavLink to="/archive">Archive gallery</NavLink>
            <NavLink to={`/eras/${selectedEra?.slug ?? 'black-empire'}`}>Era dossier</NavLink>
          </nav>
        </div>}
      </header>
      {children}
      <footer className="footer">
        <strong>Unofficial fan project.</strong> Azeroth Chronicle is a fan-made interpretation of the Warcraft universe
        and is not affiliated with, endorsed by, sponsored by, or approved by Blizzard Entertainment.
      </footer>
    </div>
  );
}
