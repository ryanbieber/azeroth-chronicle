import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { useEraStore } from '../../src/app/state/eraStore';
import { useStoryStore } from '../../src/app/state/storyStore';
import { LandingPage } from '../../src/pages/LandingPage';

describe('landing page', () => {
  beforeEach(() => {
    sessionStorage.clear();
    useEraStore.setState({ eraId: 'black-empire' });
    useStoryStore.setState({ guideId: null, nodeId: null, status: 'paused', branchReturn: null });
  });

  it('places the full history tour front and center over an obscured still montage', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /the full history/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /full tour of the history/i })).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Choose an era to tour' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Tour this era' })).toBeVisible();
    expect(screen.getByRole('link', { name: /browse the illustrated archive/i })).toHaveAttribute('href', '/archive');
    expect(container.querySelectorAll('.landing-still')).toHaveLength(7);

    await user.click(screen.getByRole('button', { name: /full tour of the history/i }));
    expect(useEraStore.getState().eraId).toBe('cosmic-origins');
    expect(useStoryStore.getState()).toMatchObject({
      guideId: 'cosmic-origins-guided-history',
      nodeId: 'cosmic-origins-story-light-shadow',
      status: 'playing',
    });
  });

  it('starts only the selected era tour', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><LandingPage /></MemoryRouter>);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Choose an era to tour' }), 'long-vigil-new-kingdoms');
    await user.click(screen.getByRole('button', { name: 'Tour this era' }));
    expect(useEraStore.getState().eraId).toBe('long-vigil-new-kingdoms');
    expect(useStoryStore.getState().guideId).toBe('long-vigil-new-kingdoms-guided-history');
  });
});
