import { expect, test } from '@playwright/test';

test('legacy atlas links open the tour chooser instead of a free explorer', async ({ page }) => {
  await page.goto('/map?era=long-vigil-new-kingdoms&selected=entity:strom');
  await expect(page).toHaveURL(/\/\?era=long-vigil-new-kingdoms/);
  await expect(page.getByRole('combobox', { name: 'Choose an era to tour' })).toHaveValue('long-vigil-new-kingdoms');
  await expect(page.getByRole('button', { name: 'Tour this era' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore the atlas freely' })).toHaveCount(0);
});

test('a selected era opens a guided scene without atlas or dossier interaction', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Choose an era to tour' }).selectOption('long-vigil-new-kingdoms');
  await page.getByRole('button', { name: 'Tour this era' }).click();
  await expect(page).toHaveURL(/era=long-vigil-new-kingdoms&tour=era/);
  await expect(page.getByRole('heading', { name: 'The broken world waits for new promises' })).toBeVisible();
  await expect(page.getByLabel('Guided historical scene')).toBeVisible();
  await expect(page.locator('.map-viewport canvas')).toHaveCSS('pointer-events', 'none');
  await expect(page.locator('.map-viewport button')).toHaveCount(0);
  await expect(page.getByRole('complementary', { name: 'Selected atlas record' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Leave tour' })).toBeVisible();
});

test('Era 5 moves from Hyjal to Strom and the later kingdoms on the corrected terrain', async ({ page }) => {
  test.setTimeout(120_000);
  const terrain = page.waitForResponse((response) => response.url().endsWith('/rise-of-the-horde-post-sundering-map-research/terrain-atlas.research.webp'));
  await page.goto('/map?era=long-vigil-new-kingdoms&tour=era');
  expect((await terrain).status()).toBe(200);
  await expect(page.locator('.map-caption')).toContainText('INTERPRETIVE EARLY POST-SUNDERING STATE');
  for (let chapter = 0; chapter < 7; chapter += 1) await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Scattered tribes answer one human king' })).toBeVisible();
  await expect(page.locator('.map-caption')).toContainText('INTERPRETIVE MIGRATION AND FOUNDING STATE');
  await expect(page.locator('.map-label').filter({ hasText: 'Strom' })).toBeVisible();
  await expect(page.locator('.map-viewport button')).toHaveCount(0);
  for (let chapter = 0; chapter < 3; chapter += 1) await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'One human empire becomes seven kingdoms' })).toBeVisible();
  await expect(page.locator('.map-caption')).toContainText('INTERPRETIVE LATE KINGDOM STATE');
});

test('a single-era tour finishes at the chooser without continuing into another era', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/map?era=cosmic-origins&tour=era');
  for (let chapter = 0; chapter < 8; chapter += 1) await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'One world among the stars' })).toBeVisible();
  await page.getByRole('button', { name: 'Finish this era' }).click();
  await expect(page).toHaveURL(/\/\?tour=era-complete&era=cosmic-origins/);
  await expect(page.getByText('That era’s story is complete.')).toBeVisible();
});

test('representative guided renderer stays inside the Phase 0 scene budgets', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/map?era=black-empire&tour=era&profile=1');
  const output = page.getByTestId('performance-report');
  await expect(output).not.toHaveText('Sampling renderer…', { timeout: 75_000 });
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
