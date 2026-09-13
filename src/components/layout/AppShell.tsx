import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink className="brand" to="/map?era=black-empire">
          <span className="brand-mark">AC</span>
          <span>
            <strong>Azeroth Chronicle</strong>
            <small>Historical atlas prototype</small>
          </span>
        </NavLink>
        <nav aria-label="Primary navigation">
          <NavLink to="/map?era=black-empire">Atlas</NavLink>
          <NavLink to="/eras/black-empire">Era dossier</NavLink>
        </nav>
      </header>
      {children}
      <footer className="footer">
        Unofficial fan project · Original placeholder assets · Source review required before publication
      </footer>
    </div>
  );
}
