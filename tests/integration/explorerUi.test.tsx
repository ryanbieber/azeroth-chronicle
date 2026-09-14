import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLayerStore } from '../../src/app/state/layerStore';
import { useSelectionStore } from '../../src/app/state/selectionStore';
import { useSourceFilterStore } from '../../src/app/state/sourceFilterStore';
import { MapPage } from '../../src/pages/MapPage';

vi.mock('../../src/components/map/MapViewport3D', () => ({
  MapViewport3D: () => <div aria-label="Mock 3D map" />,
}));

describe('explorer UI', () => {
  beforeEach(() => {
    useLayerStore.getState().reset();
    useSelectionStore.getState().select(null);
    useSourceFilterStore.getState().setSourceIds([]);
  });

  it('restores selection while keeping the curated atlas layers visible', async () => {
    render(
      <MemoryRouter initialEntries={['/map?era=black-empire&selected=battle:elemental-assault-on-black-empire&layers=regions,battles']}>
        <MapPage />
      </MemoryRouter>,
    );
    expect(useSelectionStore.getState().selection).toEqual({ kind: 'battle', id: 'elemental-assault-on-black-empire' });
    expect(useLayerStore.getState().visible).toEqual({ regions: true, battles: true, locations: true, routes: true, labels: true });
    expect(screen.queryByText('Visible layers')).not.toBeInTheDocument();
    expect(screen.queryByText('Source filters')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Map key' })).toBeVisible();
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('opens a compact dossier for a selected map entity without restoring archive controls', async () => {
    render(
      <MemoryRouter initialEntries={['/map?era=black-empire&selected=entity:yshaarj-central-bastion']}>
        <MapPage />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('button', { name: /history/i })).not.toBeInTheDocument();
    const dossier = screen.getByRole('complementary', { name: 'Selected atlas record' });
    expect(dossier).toHaveTextContent("Y'Shaarj's Central Bastion");
    expect(screen.queryByRole('link', { name: 'Read full dossier' })).not.toBeInTheDocument();
  });
});
