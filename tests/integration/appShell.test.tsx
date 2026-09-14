import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppShell } from '../../src/components/layout/AppShell';

describe('application shell', () => {
  it('identifies the project as fan-made and unaffiliated with Blizzard Entertainment', () => {
    render(<MemoryRouter initialEntries={['/map?era=black-empire']}><AppShell><main>Atlas</main></AppShell></MemoryRouter>);
    expect(screen.getByText(/not affiliated with, endorsed by, sponsored by, or approved by Blizzard Entertainment/i)).toBeVisible();
    expect(screen.getByText('Unofficial fan atlas')).toBeVisible();
    const selector = screen.getByRole('combobox', { name: 'Choose era' });
    expect(selector).toBeVisible();
    expect(screen.getAllByRole('option')).toHaveLength(10);
    expect(screen.getByRole('option', { name: 'Cosmic Origins' })).toBeVisible();
    expect(screen.getByRole('option', { name: 'Primordial Azeroth and the Black Empire' })).toBeVisible();
    expect(screen.getByRole('option', { name: 'The Modern Cosmic Age' })).toBeVisible();
  });
});
