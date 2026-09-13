import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLayerStore } from '../../src/app/state/layerStore';
import { useSelectionStore } from '../../src/app/state/selectionStore';
import { useSourceFilterStore } from '../../src/app/state/sourceFilterStore';
import { MapPage } from '../../src/pages/MapPage';

vi.mock('../../src/components/map/MapViewport3D', () => ({
  MapViewport3D: () => <div aria-label="Mock 3D map" />,
}));

function LocationProbe() {
  return <output data-testid="location">{useLocation().search}</output>;
}

describe('explorer UI', () => {
  beforeEach(() => {
    useLayerStore.getState().reset();
    useSelectionStore.getState().select(null);
    useSourceFilterStore.getState().setSourceIds([]);
  });

  it('restores controls and selection from the URL and writes layer changes back', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/map?era=black-empire&selected=battle:atlas-conflict-placeholder&layers=regions,battles']}>
        <MapPage />
        <LocationProbe />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: 'Atlas Conflict Placeholder' })).toBeVisible();
    expect(screen.getByLabelText('Locations')).not.toBeChecked();
    expect(screen.getByLabelText('Routes')).not.toBeChecked();
    await user.click(screen.getByLabelText('Routes'));
    expect(await screen.findByTestId('location')).toHaveTextContent('layers=regions%2Cbattles%2Croutes');
  });

  it('searches generated records and opens the selected dossier', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/map?era=black-empire']}><MapPage /></MemoryRouter>);
    await user.type(screen.getByRole('searchbox', { name: 'Search archive' }), 'archive site');
    await user.click(screen.getByRole('button', { name: 'Show' }));
    expect(await screen.findByRole('heading', { name: 'Archive Site Placeholder' })).toBeVisible();
  });
});
