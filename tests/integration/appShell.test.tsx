import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppShell } from '../../src/components/layout/AppShell';

describe('application shell', () => {
  it('identifies the project as fan-made and unaffiliated with Blizzard Entertainment', () => {
    render(<MemoryRouter initialEntries={['/map?era=black-empire']}><AppShell><main>Atlas</main></AppShell></MemoryRouter>);
    expect(screen.getByText(/not affiliated with, endorsed by, sponsored by, or approved by Blizzard Entertainment/i)).toBeVisible();
    expect(screen.getByText('Unofficial fan atlas')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Choose a tour' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Archive gallery' })).toHaveAttribute('href', '/archive');
    expect(screen.queryByRole('link', { name: 'Atlas' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Era dossier' })).not.toBeInTheDocument();
  });
});
