import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ArchiveGalleryPage } from '../../src/pages/ArchiveGalleryPage';

describe('archive gallery', () => {
  it('searches, enlarges, and reveals the lore and stats for Aman’Thul', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/archive']}><ArchiveGalleryPage /></MemoryRouter>);

    await user.type(screen.getByRole('searchbox', { name: 'Search the collection' }), 'Aman’Thul');
    await user.click(screen.getByRole('button', { name: 'Open Aman’Thul' }));

    const dialog = screen.getByRole('dialog', { name: 'Aman’Thul' });
    expect(within(dialog).getByRole('img', { name: 'Visual archive asset for Aman’Thul' })).toBeVisible();
    expect(within(dialog).getByText('Highfather of the Pantheon')).toBeVisible();
    expect(within(dialog).getByText(/search gathered the awakened titans/i)).toBeVisible();
    expect(within(dialog).queryByRole('link', { name: 'Open full dossier' })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('link', { name: 'Open in atlas' })).not.toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open Aman’Thul' })).toHaveFocus();
  });

  it('restores a directly linked record and supports keyboard browsing', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/archive?category=character&entry=entity:amanthul']}>
        <ArchiveGalleryPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: /Characters/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('dialog', { name: 'Aman’Thul' })).toBeVisible();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('dialog')).not.toHaveAccessibleName('Aman’Thul');
  });
});
