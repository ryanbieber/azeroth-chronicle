import { expect, test } from '@playwright/test';

test('application shell and era dossier visual state', async ({ page }) => {
  await page.goto('/eras/black-empire');
  await expect(page).toHaveScreenshot('era-dossier.png', { fullPage: true });
});

test('battle dossier visual state', async ({ page }) => {
  await page.goto('/battles/atlas-conflict-placeholder');
  await expect(page).toHaveScreenshot('battle-dossier.png', { fullPage: true });
});
