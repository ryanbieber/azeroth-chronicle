import { expect, test } from '@playwright/test';

test('Third War tour keeps projected people and names readable', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/map?era=third-war-frozen-throne&tour=full');
  await expect(page.locator('.story-card h2')).toHaveText('The defeated inherit another beginning');
  for (let step = 0; step < 15; step += 1) {
    await page.waitForTimeout(900);
    const heading = await page.locator('.story-card h2').textContent();
    const figures = await page.locator('.map-character-figure, .map-subject-visual').evaluateAll((elements) => elements.map((element) => {
      const box = element.getBoundingClientRect();
      const label = element.querySelector('span')?.getBoundingClientRect();
      return {
        name: element.getAttribute('aria-label'),
        box: { x: box.x, y: box.y, width: box.width, height: box.height },
        label: label ? { x: label.x, y: label.y, width: label.width, height: label.height } : null,
      };
    }));
    const collisions: string[] = [];
    for (let i = 0; i < figures.length; i += 1) {
      for (let j = i + 1; j < figures.length; j += 1) {
        const a = figures[i]!;
        const b = figures[j]!;
        const x = Math.max(0, Math.min(a.box.x + a.box.width, b.box.x + b.box.width) - Math.max(a.box.x, b.box.x));
        const y = Math.max(0, Math.min(a.box.y + a.box.height, b.box.y + b.box.height) - Math.max(a.box.y, b.box.y));
        const figureArea = Math.min(a.box.width * a.box.height, b.box.width * b.box.height);
        if (x * y > figureArea * 0.15) collisions.push(`${a.name} / ${b.name}: ${Math.round(x * y)}px²`);
        if (a.label && b.label) {
          const labelX = Math.max(0, Math.min(a.label.x + a.label.width, b.label.x + b.label.width) - Math.max(a.label.x, b.label.x));
          const labelY = Math.max(0, Math.min(a.label.y + a.label.height, b.label.y + b.label.height) - Math.max(a.label.y, b.label.y));
          if (labelX * labelY > 0) collisions.push(`${a.name} / ${b.name}: labels overlap`);
        }
      }
    }
    expect(collisions, `Chapter ${step + 1}: ${heading}`).toEqual([]);
    if (step < 14) {
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await expect(page.locator('.story-card h2')).not.toHaveText(heading ?? '');
    }
  }
});
