import { expect, test } from '@playwright/test';

test('production deep link restores the era, selection, layers, and external terrain', async ({ page }) => {
  const terrainResponse = page.waitForResponse((response) =>
    response.url().endsWith('/terrain.placeholder.glb'));
  await page.goto('/map?era=black-empire&selected=battle:atlas-conflict-placeholder&layers=regions,battles&profile=1');

  await expect(page.getByRole('heading', { name: 'The Black Empire' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Atlas Conflict Placeholder' })).toBeVisible();
  await expect(page.getByLabel('Domains')).toBeChecked();
  await expect(page.getByLabel('Routes')).not.toBeChecked();
  expect((await terrainResponse).status()).toBe(200);

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Atlas Conflict Placeholder' })).toBeVisible();
});

test('representative desktop renderer stays inside the Phase 0 scene budgets', async ({ page }) => {
  await page.goto('/map?era=black-empire&profile=1');
  const output = page.getByTestId('performance-report');
  await expect(output).not.toHaveText('Sampling renderer…', { timeout: 15_000 });
  const report = JSON.parse(await output.textContent() ?? '{}') as {
    medianFrameMs: number;
    p95FrameMs: number;
    drawCalls: number;
    sampleFrames: number;
    usefulSceneMs: number;
  };
  test.info().annotations.push({ type: 'renderer-metrics', description: JSON.stringify(report) });

  expect(report.sampleFrames).toBe(180);
  expect(report.medianFrameMs).toBeLessThanOrEqual(16.7);
  expect(report.p95FrameMs).toBeLessThanOrEqual(25);
  expect(report.drawCalls).toBeLessThanOrEqual(25);
  expect(report.usefulSceneMs).toBeLessThanOrEqual(2500);
});

test('guide branches, resumes, plays a battle, exposes provenance, and completes', async ({ page }) => {
  await page.goto('/map?era=black-empire');
  await page.getByRole('button', { name: 'Experience the era' }).click();
  await expect(page.getByText('Story 1 of 8')).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByText('Story 2 of 8')).toBeVisible();

  await page.getByRole('link', { name: 'Explore Unnamed Domain' }).click();
  await expect(page).toHaveURL(/\/factions\/unnamed-domain-placeholder$/);
  await page.getByRole('link', { name: 'Return to guided history' }).click();
  await expect(page.getByText('Story 2 of 8')).toBeVisible();

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByText('Story 4 of 8')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Atlas Conflict Placeholder' })).toBeVisible();
  await page.getByRole('button', { name: 'Skip to result' }).click();
  await expect(page.getByRole('heading', { name: 'Documented result' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Why this matters: causes and consequences' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Claims and provenance' })).toBeVisible();

  for (let node = 5; node <= 8; node += 1) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText(`Story ${node} of 8`)).toBeVisible();
  }
  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(page.getByRole('button', { name: 'Experience the era' })).toBeVisible();
});

test('source filters remove unsupported archive results', async ({ page }) => {
  await page.goto('/map?era=black-empire');
  await page.getByLabel('World of Warcraft: Chronicle Volume 1').check();
  await page.getByRole('searchbox', { name: 'Search archive' }).fill('conflict');
  await expect(page.getByText('No matching records in this era.')).toBeVisible();
});
