import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { AppErrorBoundary } from '../components/layout/AppErrorBoundary';
import { BattlePage } from '../pages/BattlePage';
import { EraPage, NotFound } from '../pages/EraPage';
import { EntityPage } from '../pages/EntityPage';
import { EventPage } from '../pages/EventPage';

const MapPage = lazy(() => import('../pages/MapPage').then((module) => ({ default: module.MapPage })));

export function App() {
  return (
    <AppShell>
      <AppErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate replace to="/map?era=black-empire" />} />
        <Route
          path="/map"
          element={(
            <Suspense fallback={<main className="loading-state" role="status">Opening the atlas…</main>}>
              <MapPage />
            </Suspense>
          )}
        />
        <Route path="/eras/:slug" element={<EraPage />} />
        <Route path="/battles/:slug" element={<BattlePage />} />
        <Route path="/events/:slug" element={<EventPage />} />
        <Route path="/locations/:slug" element={<EntityPage />} />
        <Route path="/factions/:slug" element={<EntityPage />} />
        <Route path="/characters/:slug" element={<EntityPage />} />
        <Route path="/artifacts/:slug" element={<EntityPage />} />
        <Route path="/records/:slug" element={<EntityPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </AppErrorBoundary>
    </AppShell>
  );
}
