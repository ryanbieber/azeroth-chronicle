import { expect, test } from '@playwright/test';

test('production deep link restores the era and selection with curated layers and external terrain', async ({ page }) => {
  const terrainResponses = Promise.all([
    page.waitForResponse((response) => response.url().endsWith('/terrain-atlas.research.webp')),
    page.waitForResponse((response) => response.url().endsWith('/terrain-height.research.webp')),
  ]);
  await page.goto('/map?era=black-empire&selected=battle:elemental-assault-on-black-empire&layers=regions,battles&profile=1');

  await expect(page.getByRole('combobox', { name: 'Choose era' })).toHaveValue('black-empire');
  await expect(page.getByText('Visible layers')).toHaveCount(0);
  await expect(page.getByText('Source filters')).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Map key' })).toBeVisible();
  await expect(page.getByRole('complementary')).toHaveCount(0);
  expect((await terrainResponses).every((response) => response.status() === 200)).toBe(true);
  const viewport = await page.evaluate(() => ({ pageHeight: document.documentElement.scrollHeight, viewportHeight: window.innerHeight }));
  expect(viewport.pageHeight).toBeLessThanOrEqual(viewport.viewportHeight);

  await page.reload();
  await expect(page).toHaveURL(/selected=battle%3Aelemental-assault-on-black-empire/);
});

test('representative desktop renderer stays inside the Phase 0 scene budgets', async ({ page }) => {
  await page.goto('/map?era=black-empire&profile=1');
  const output = page.getByTestId('performance-report');
  await expect(output).not.toHaveText('Sampling renderer…', { timeout: 15_000 });
  const report = JSON.parse(await output.textContent() ?? '{}') as {
    renderer: string;
    medianFrameMs: number;
    p95FrameMs: number;
    drawCalls: number;
    sampleFrames: number;
    usefulSceneMs: number;
  };
  test.info().annotations.push({ type: 'renderer-metrics', description: JSON.stringify(report) });

  expect(report.sampleFrames).toBe(90);
  if (!report.renderer.toLocaleLowerCase().includes('swiftshader')) {
    expect(report.medianFrameMs).toBeLessThanOrEqual(16.7);
    expect(report.p95FrameMs).toBeLessThanOrEqual(25);
  }
  expect(report.drawCalls).toBeLessThanOrEqual(25);
  expect(report.usefulSceneMs).toBeLessThanOrEqual(2500);
});

test('guide advances automatically, uses only previous and next, and plays battle phases', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/map?era=black-empire');
  await page.getByRole('button', { name: 'Guided tour' }).click();
  await expect(page.getByText('Story 1 of 10')).toBeVisible();
  await expect(page.getByText('Story 2 of 10')).toBeVisible({ timeout: 35_000 });
  await expect(page.getByRole('progressbar', { name: 'Time until next story point' })).toBeVisible();
  await expect(page.locator('.story-card button')).toHaveCount(2);

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByText('Story 4 of 10')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The winds divide' })).toBeVisible();
  await expect(page.getByRole('button', { name: "Al'Akir", exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Fire overwhelms' })).toBeVisible({ timeout: 24_000 });
  await expect(page.getByRole('button', { name: 'Ragnaros', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: "Al'Akir", exact: true })).toHaveCount(0);

  for (let node = 5; node <= 10; node += 1) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText(`Story ${node} of 10`)).toBeVisible();
  }
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Guided tour' })).toBeVisible();
});

test('the curated Chronicle scope cannot be disabled by visitors', async ({ page }) => {
  await page.goto('/map?era=black-empire');
  await expect(page.getByRole('button', { name: /controls/i })).toHaveCount(0);
  await expect(page.getByRole('checkbox')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Guided tour' })).toBeVisible();
});
