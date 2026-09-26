import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSelectionStore } from '../../src/app/state/selectionStore';
import { useStoryStore } from '../../src/app/state/storyStore';
import { MapPage } from '../../src/pages/MapPage';

vi.mock('../../src/components/map/MapViewport3D', () => ({
  MapViewport3D: ({ readOnly }: { readOnly?: boolean }) => <div aria-label="Mock guided scene" data-read-only={String(readOnly)} />,
}));

describe('guided scene UI', () => {
  beforeEach(() => {
    useSelectionStore.getState().select(null);
    useStoryStore.setState({ guideId: null, nodeId: null, status: 'paused', branchReturn: null });
  });

  it('keeps the scene noninteractive and does not open a selected record dossier', () => {
    render(
      <MemoryRouter initialEntries={['/map?era=black-empire&tour=era&selected=entity:yshaarj-central-bastion']}>
        <MapPage />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('Mock guided scene')).toHaveAttribute('data-read-only', 'true');
    expect(screen.queryByRole('complementary', { name: 'Selected atlas record' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Close dossier' })).not.toBeInTheDocument();
  });
});
