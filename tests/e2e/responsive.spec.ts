import { expect, test } from '@playwright/test';

const phoneViewport = { width: 390, height: 844 };

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
}

test.describe('responsive application shell', () => {
  test('keeps the mobile landing actions readable and clear of the era thread', async ({ page }) => {
    await page.setViewportSize(phoneViewport);
    await page.goto('/');

    const primaryAction = page.getByRole('button', { name: /Full tour of the history/i });
    const freeExplore = page.getByRole('link', { name: 'Explore the atlas freely' });
    const eraThread = page.getByLabel('Current guided history coverage');
    await expect(primaryAction).toBeVisible();
    await expect(freeExplore).toBeVisible();
    await expect(eraThread).toBeVisible();

    const actionBox = await freeExplore.boundingBox();
    const threadBox = await eraThread.boundingBox();
    expect(actionBox).not.toBeNull();
    expect(threadBox).not.toBeNull();
    expect(threadBox!.y).toBeGreaterThanOrEqual(actionBox!.y + actionBox!.height);
    expect((await primaryAction.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await expectNoHorizontalOverflow(page);
  });

  test('keeps atlas navigation and controls available on a phone', async ({ page }) => {
    await page.setViewportSize(phoneViewport);
    await page.goto('/map?era=cosmic-origins');

    await expect(page.getByRole('combobox', { name: 'Choose era' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guided tour' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Archive gallery' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Era dossier' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('keeps guided playback controls in view on a phone', async ({ page }) => {
    await page.setViewportSize(phoneViewport);
    await page.goto('/map?era=third-war-frozen-throne&tour=full');
    const card = page.locator('.story-card');
    await expect(card.getByRole('heading', { name: 'The defeated inherit another beginning' })).toBeVisible();
    await expect(card.getByRole('button', { name: 'Pause tour' })).toBeVisible();
    const next = card.getByRole('button', { name: 'Next', exact: true });
    const nextBox = await next.boundingBox();
    const stageBox = await page.getByLabel('Atlas map workspace').boundingBox();
    expect(nextBox).not.toBeNull();
    expect(stageBox).not.toBeNull();
    expect(nextBox!.y + nextBox!.height).toBeLessThanOrEqual(stageBox!.y + stageBox!.height);
    await card.getByRole('button', { name: 'Pause tour' }).click();
    await expect(card.getByRole('button', { name: 'Resume tour' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('uses readable single-column archive cards on a phone', async ({ page }) => {
    await page.setViewportSize(phoneViewport);
    await page.goto('/archive');

    const firstCard = page.locator('.archive-card').first();
    const firstMedia = firstCard.locator('.archive-card-media');
    const firstCopy = firstCard.locator('.archive-card-copy');
    await expect(firstCard).toBeVisible();

    const cardBox = await firstCard.boundingBox();
    const mediaBox = await firstMedia.boundingBox();
    const copyBox = await firstCopy.boundingBox();
    expect(cardBox).not.toBeNull();
    expect(mediaBox).not.toBeNull();
    expect(copyBox).not.toBeNull();
    expect(cardBox!.width).toBeGreaterThan(340);
    expect(copyBox!.x).toBeGreaterThanOrEqual(mediaBox!.x + mediaBox!.width - 1);
    await expectNoHorizontalOverflow(page);
  });

  test('preserves the full desktop header and atlas workspace', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/map?era=cosmic-origins');

    await expect(page.getByText('Unofficial fan atlas')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
    await expect(page.getByLabel('Atlas map workspace')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('switches the crowded header to the compact layout on a tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/map?era=cosmic-origins');

    await expect(page.getByRole('link', { name: /Azeroth Chronicle/ })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Choose era' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
