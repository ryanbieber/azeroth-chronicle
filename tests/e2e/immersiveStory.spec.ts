import { expect, test } from '@playwright/test';

for (const viewport of [{ width: 1440, height: 900 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
  test(`story fills the viewport and can return to the atlas at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/map?era=cosmic-origins&tour=full');
    await expect(page).toHaveTitle('Azerothium');
    await expect(page.getByRole('heading', { name: 'Before time could be counted' })).toBeVisible();
    await page.getByRole('button', { name: 'Pause tour' }).click();
    await expect(page.locator('.topbar')).toBeHidden();
    const bounds = await page.getByLabel('Atlas map workspace').boundingBox();
    expect(bounds).toEqual({ x: 0, y: 0, ...viewport });
    const environment = page.locator('.story-atmosphere');
    expect(await environment.boundingBox()).toEqual(bounds);
    await expect(environment.locator('img')).toHaveJSProperty('complete', true);
    expect(await environment.locator('img').evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const transcript = page.getByLabel('Chapter transcript');
    await transcript.focus();
    await expect(transcript).toBeFocused();
    expect((await transcript.boundingBox())!.height).toBeGreaterThan(24);
    for (const name of ['Return to atlas', 'Enable voice-over', 'Resume tour', 'Next']) {
      const button = page.getByRole('button', { name, exact: true });
      await expect(button).toBeInViewport();
      const box = (await button.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    }
    const voice = page.getByRole('button', { name: 'Enable voice-over' });
    await expect(page.locator('.story-world-header')).toContainText('Voice off');
    expect((await voice.boundingBox())!.y).toBeLessThan(viewport.height / 3);
    await expect(page.locator('.story-controls .story-voiceover')).toHaveCount(0);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'The Great Dark opens' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Resume tour' })).toBeVisible();
    await page.getByRole('button', { name: 'Return to atlas' }).click();
    await expect(page).not.toHaveURL(/tour=full/);
    await expect(page.locator('.story-card')).toHaveCount(0);
    await expect(environment).toHaveCount(0);
    await expect(page.getByRole('combobox', { name: 'Choose era' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Guided tour' })).toBeVisible();
    await expect(page.locator('.story-card')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test('audio carries the journey into the next era and keeps voice enabled', async ({ page }) => {
  await page.goto('/map?era=cosmic-origins&tour=full');
  for (let chapter = 0; chapter < 8; chapter += 1) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'One world among the stars' })).toBeVisible();
  await page.getByRole('button', { name: 'Enable voice-over' }).click();
  await expect.poll(() => page.locator('audio').evaluate((element: HTMLAudioElement) =>
    !element.paused && Number.isFinite(element.duration))).toBe(true);
  await page.locator('audio').evaluate((element: HTMLAudioElement) => { element.currentTime = element.duration - 0.1; });
  await expect(page).toHaveURL(/era=black-empire&tour=full/);
  await expect(page.getByRole('heading', { name: 'Before the empire' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Voice-over on' })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.locator('audio').evaluate((element: HTMLAudioElement) =>
    !element.paused && element.currentTime > 0)).toBe(true);
});

test('a paused era ending waits for resume before automatically continuing', async ({ page }) => {
  await page.clock.install();
  await page.goto('/map?era=cosmic-origins&tour=full');
  await page.getByRole('button', { name: 'Pause tour' }).click();
  for (let chapter = 0; chapter < 8; chapter += 1) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
  }
  await page.clock.fastForward(120_000);
  await expect(page.getByRole('heading', { name: 'One world among the stars' })).toBeVisible();
  await page.getByRole('button', { name: 'Resume tour' }).click();
  await page.clock.fastForward(120_000);
  await expect(page).toHaveURL(/era=black-empire&tour=full/);
  await expect(page.getByRole('heading', { name: 'Before the empire' })).toBeVisible();
});
