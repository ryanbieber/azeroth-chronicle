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
  await expect(page.getByRole('region', { name: 'Interpretation note' })).toBeVisible();
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

test('guide advances as one unnumbered sequence with only previous and next', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/map?era=black-empire');
  await page.getByRole('button', { name: 'Guided tour' }).click();
  await expect(page.getByRole('heading', { name: 'Before the empire' })).toBeVisible();
  await expect(page.getByText(/Story \d+ of \d+/)).toHaveCount(0);
  await expect(page.locator('.battle-playback')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'The sleeping titan within' })).toBeVisible({ timeout: 42_000 });
  await expect(page.getByRole('progressbar', { name: 'Time until next story point' })).toBeVisible();
  await expect(page.locator('.story-card button')).toHaveCount(2);

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'An age of elemental war' })).toBeVisible();
  const alakirFigure = page.getByRole('button', { name: "Al'Akir", exact: true });
  await expect(alakirFigure).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ragnaros', exact: true })).toBeVisible();
  await expect(page.locator('.battle-playback')).toHaveCount(0);

  const remainingTitles = [
    'The Old Gods descend',
    "The empire's builders",
    "A bastion near the world's center",
    'The Black Empire spreads',
    'Old rivals form one resistance',
    'A world awaiting the Ordering',
  ];
  for (const title of remainingTitles) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Guided tour' })).toBeVisible();
});

test('the curated Chronicle scope cannot be disabled by visitors', async ({ page }) => {
  await page.goto('/map?era=black-empire');
  await expect(page.getByRole('button', { name: /controls/i })).toHaveCount(0);
  await expect(page.getByRole('checkbox')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Guided tour' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ragnaros', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Ragnaros', exact: true }).click();
  await expect(page).toHaveURL(/selected=entity%3Aragnaros/);
  const dossier = page.getByRole('complementary', { name: 'Selected atlas record' });
  await expect(dossier.getByRole('heading', { name: 'Ragnaros' })).toBeVisible();
  await expect(dossier.getByText('The Firelord')).toBeVisible();
  await expect(dossier.getByText(/Favored direct force/)).toBeVisible();
  await expect(dossier.getByRole('link', { name: 'Read full dossier' })).toHaveCount(0);
  await expect(dossier.getByText('Claims and provenance')).toHaveCount(0);
});

test('Cosmic Origins uses relational cosmography and reader-opened character context', async ({ page }) => {
  const fieldResponse = page.waitForResponse((response) => response.url().endsWith('/cosmic-field.research.webp'));
  await page.goto('/map?era=cosmic-origins');

  await expect(page.getByRole('combobox', { name: 'Choose era' })).toHaveValue('cosmic-origins');
  await expect(page.locator('.map-caption')).toContainText('RELATIONAL COSMOGRAPHY · NOT TO SPATIAL SCALE');
  await expect(page.getByRole('button', { name: 'Aman’Thul', exact: true })).toBeVisible();
  expect((await fieldResponse).status()).toBe(200);

  await page.getByRole('button', { name: 'Guided tour' }).click();
  await expect(page.getByRole('heading', { name: 'Before time could be counted' })).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Selected atlas record' })).toHaveCount(0);
  await expect(page.getByText(/Story \d+ of \d+/)).toHaveCount(0);
  await expect(page.locator('.battle-playback')).toHaveCount(0);

  await page.getByRole('button', { name: 'Aman’Thul', exact: true }).click();
  const dossier = page.getByRole('complementary', { name: 'Selected atlas record' });
  await expect(dossier.getByRole('heading', { name: 'Aman’Thul' })).toBeVisible();
  await expect(dossier.locator('.entity-overview-lede')).toContainText(/first titan to awaken/i);
});
