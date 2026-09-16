import { expect, test } from '@playwright/test';

test('the generated archive opens Aman’Thul as an illustrated, shareable record', async ({ page }) => {
  await page.goto('/archive');

  await expect(page.getByRole('heading', { name: /Every record, gathered into one gallery/i })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search the collection' }).fill('Aman’Thul');
  await page.getByRole('button', { name: 'Open Aman’Thul' }).click();

  const dialog = page.getByRole('dialog', { name: 'Aman’Thul' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('img', { name: 'Visual archive asset for Aman’Thul' })).toBeVisible();
  await expect(dialog.getByText('Highfather of the Pantheon')).toBeVisible();
  await expect(page).toHaveURL(/entry=entity%3Aamanthul/);

  await page.reload();
  await expect(page.getByRole('dialog', { name: 'Aman’Thul' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
