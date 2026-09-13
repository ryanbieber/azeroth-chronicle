import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { BattlePage } from '../pages/BattlePage';
import { EraPage, NotFound } from '../pages/EraPage';
import { MapPage } from '../pages/MapPage';

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate replace to="/map?era=black-empire" />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/eras/:slug" element={<EraPage />} />
        <Route path="/battles/:slug" element={<BattlePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}
