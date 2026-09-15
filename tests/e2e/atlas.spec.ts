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

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The Pantheon gathers' })).toBeVisible();
  const pantheonVisual = page.locator('.map-subject-visual').filter({ hasText: 'The Pantheon of Order' });
  await expect(pantheonVisual).toBeVisible();
  await pantheonVisual.click();
  await expect(dossier.getByRole('heading', { name: 'The Pantheon of Order' })).toBeVisible();
  await expect(dossier.locator('.entity-overview-portrait')).toBeVisible();
});

test('Ordering of Azeroth moves from inherited empire to a contextual ordered world', async ({ page }) => {
  const orderedTerrainResponse = page.waitForResponse((response) => response.url().endsWith('/ordering-of-azeroth-map-research/terrain-atlas.research.webp'));
  await page.goto('/map?era=ordering-of-azeroth');

  await expect(page.getByRole('combobox', { name: 'Choose era' })).toHaveValue('ordering-of-azeroth');
  await expect(page.locator('.map-caption')).toContainText('INTERPRETIVE BEFORE/AFTER CARTOGRAPHY');
  expect((await orderedTerrainResponse).status()).toBe(200);
  await expect(page.getByRole('button', { name: 'Aggramar', exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: 'Guided tour' }).click();
  await expect(page.getByRole('heading', { name: 'The world the keepers inherited' })).toBeVisible();
  await expect(page.locator('.map-caption')).toContainText('INTERPRETIVE CARTOGRAPHY');
  await expect(page.getByText(/Story \d+ of \d+/)).toHaveCount(0);
  await expect(page.locator('.battle-playback')).toHaveCount(0);

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A watcher finds the hidden world' })).toBeVisible();
  const aggramar = page.getByRole('button', { name: 'Aggramar', exact: true });
  await expect(aggramar).toBeVisible();
  await expect(page.locator('.map-subject-visual').filter({ hasText: 'The Pantheon of Order' })).toBeVisible();
  await aggramar.click();
  const dossier = page.getByRole('complementary', { name: 'Selected atlas record' });
  await expect(dossier.getByRole('heading', { name: 'Aggramar' })).toBeVisible();
  await expect(dossier.locator('.entity-overview-portrait')).toBeVisible();
  await page.getByRole('button', { name: 'Close dossier' }).click();

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Victory becomes a wound' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Aman’Thul', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: "Y'Shaarj", exact: true })).toBeVisible();
  for (let index = 0; index < 4; index += 1) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'Chains beneath the earth' })).toBeVisible();
  await expect(page.locator('.map-caption')).toContainText('INTERPRETIVE BEFORE/AFTER CARTOGRAPHY');
  await expect(page.locator('.map-subject-visual').filter({ hasText: 'The Old Gods' })).toBeVisible();
  await expect(page.locator('.map-subject-visual').filter({ hasText: 'The Keepers' })).toBeVisible();

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The wound becomes a well' })).toBeVisible();
  await page.getByRole('button', { name: 'The Well of Eternity', exact: true }).click();
  await expect(dossier.getByRole('heading', { name: 'The Well of Eternity' })).toBeVisible();
  await expect(dossier.locator('.entity-overview-lede')).toContainText(/arcane lake/i);
});

test('Ancient Civilizations advances through distinct political time slices and contextual actors', async ({ page }) => {
  await page.goto('/map?era=ancient-civilizations');
  await expect(page.getByRole('combobox', { name: 'Choose era' })).toHaveValue('ancient-civilizations');
  await page.getByRole('button', { name: 'Guided tour' }).click();

  await expect(page.getByRole('heading', { name: 'The ordered world begins to remember' })).toBeVisible();
  await expect(page.locator('.map-caption')).toContainText('INTERPRETIVE POLITICAL TIME SLICE');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Many peoples beneath one sky' })).toBeVisible();
  await expect(page.locator('.map-subject-visual').filter({ hasText: 'The Empire of Zul' })).toBeVisible();

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The earth gives back an ancient enemy' })).toBeVisible();
  await expect(page.locator('.map-subject-visual').filter({ hasText: 'Aqir' })).toBeVisible();

  for (let index = 0; index < 4; index += 1) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'One king takes the storm' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Lei Shen', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Empty hands become a promise' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Kang', exact: true })).toBeVisible();

  for (let index = 0; index < 3; index += 1) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'A queen at the edge of ruin' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Queen Azshara', exact: true })).toBeVisible();
  await expect(page.locator('.map-subject-visual').filter({ hasText: 'The Kaldorei Empire' })).toBeVisible();
});

test('War of the Ancients preserves its guided story across the Sundering state change', async ({ page }) => {
  await page.goto('/map?era=war-of-the-ancients');
  await expect(page.getByRole('combobox', { name: 'Choose era' })).toHaveValue('war-of-the-ancients');
  await expect(page.locator('.map-caption')).toContainText('INTERPRETIVE POST-SUNDERING STATE');

  await page.getByRole('button', { name: 'Guided tour' }).click();
  await expect(page.getByRole('heading', { name: 'The empire stands beneath its last unbroken sky' })).toBeVisible();
  await expect(page.locator('.map-caption')).toContainText('INTERPRETIVE PRE-INVASION STATE');
  await expect(page.getByRole('button', { name: 'Queen Azshara', exact: true })).toBeVisible();
  await expect(page.locator('.map-subject-visual').filter({ hasText: 'The Kaldorei Empire' })).toBeVisible();

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A chosen circle turns the Well into a door' })).toBeVisible();
  await expect(page.locator('.map-subject-visual').filter({ hasText: 'The Highborne' })).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Beyond the gate waits a will vast as ruin' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sargeras', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The invasion enters through the heart of empire' })).toBeVisible();
  await expect(page.locator('.map-caption')).toContainText('INTERPRETIVE WARTIME STATE');
  await expect(page.locator('.map-subject-visual').filter({ hasText: 'The Burning Legion' })).toBeVisible();
  await expect(page.locator('.battle-playback')).toHaveCount(0);

  for (let index = 0; index < 5; index += 1) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'The war returns to the water at its beginning' })).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'One continent becomes a memory' })).toBeVisible();
  await expect(page.locator('.map-caption')).toContainText('INTERPRETIVE POST-SUNDERING STATE');
  await expect(page.getByRole('progressbar', { name: 'Time until next story point' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Previous', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'The Maelstrom', exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('azeroth-chronicle-story'))).toContain('ancients-war-story-world-breaks');

  await page.getByRole('button', { name: 'Previous', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The war returns to the water at its beginning' })).toBeVisible();
  await expect(page.locator('.map-caption')).toContainText('INTERPRETIVE WARTIME STATE');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'One continent becomes a memory' })).toBeVisible();
});

test('Long Vigil and New Kingdoms moves from Hyjal to a plural post-Sundering world', async ({ page }) => {
  await page.goto('/map?era=long-vigil-new-kingdoms');
  await expect(page.getByRole('combobox', { name: 'Choose era' })).toHaveValue('long-vigil-new-kingdoms');
  await expect(page.locator('.map-caption')).toContainText('INTERPRETIVE LATE KINGDOM STATE');

  await page.getByRole('button', { name: 'Guided tour' }).click();
  await expect(page.getByRole('heading', { name: 'The broken world waits for new promises' })).toBeVisible();
  await expect(page.locator('.map-caption')).toContainText('INTERPRETIVE EARLY POST-SUNDERING STATE');

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'One vial restores the danger beneath Hyjal' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Illidan Stormrage', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A tree is set above the forbidden water' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Malfurion Stormrage', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tyrande Whisperwind', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A forbidden art divides the survivors' })).toBeVisible();
  await expect(page.locator('.map-caption')).toContainText('INTERPRETIVE MIGRATION AND FOUNDING STATE');
  await expect(page.locator('.map-subject-visual').filter({ hasText: 'The Highborne Exiles' })).toBeVisible();
  await expect(page.getByRole('button', { name: "Dath'Remar Sunstrider", exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A new sun rises upon contested land' })).toBeVisible();
  await expect(page.locator('.map-subject-visual').filter({ hasText: "Quel'Thalas" })).toBeVisible();
  await expect(page.locator('.map-subject-visual').filter({ hasText: 'The Amani Empire' })).toBeVisible();

  for (let index = 0; index < 3; index += 1) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'Fire changes the forest and human history' })).toBeVisible();
  await expect(page.locator('.battle-playback')).toHaveCount(0);

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'One human empire becomes seven kingdoms' })).toBeVisible();
  await expect(page.locator('.map-caption')).toContainText('INTERPRETIVE LATE KINGDOM STATE');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Three hammers break one mountain realm' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'The Dwarven Clans', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'An ancient fire answers a dying war' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ragnaros', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Many realms stand before an unopened gate' })).toBeVisible();
});

test('Rise of the Horde crosses from Draenor into the First and Second Wars without inventing a spatial bridge', async ({ page }) => {
  await page.goto('/map?era=rise-of-the-horde');
  await expect(page.getByRole('combobox', { name: 'Choose era' })).toHaveValue('rise-of-the-horde');
  await expect(page.locator('.map-caption')).toContainText('INTERPRETIVE SECOND WAR CAMPAIGN STATE');

  await page.getByRole('button', { name: 'Guided tour' }).click();
  await expect(page.getByRole('heading', { name: 'Draenor holds more than one remembered home' })).toBeVisible();
  await expect(page.locator('.map-caption')).toContainText('INTERPRETIVE DRAENOR BEFORE THE HORDE');
  await expect(page.locator('.map-subject-visual').filter({ hasText: 'The Orc Clans of Draenor' })).toBeVisible();
  await expect(page.locator('.map-subject-visual').filter({ hasText: 'The Draenei of Draenor' })).toBeVisible();

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'An old vengeance finds a younger world' })).toBeVisible();
  await expect(page.getByRole('button', { name: "Kil'jaeden", exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Trust becomes the first weapon' })).toBeVisible();
  await expect(page.locator('.map-caption')).toContainText('INTERPRETIVE DRAENOR WAR AND CORRUPTION STATE');
  await expect(page.getByRole('button', { name: "Ner'zhul", exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: "A council grows behind the warchief's chair" })).toBeVisible();
  await expect(page.getByRole('button', { name: "Gul'dan", exact: true })).toBeVisible();
  await expect(page.locator('.map-subject-visual').filter({ hasText: 'The Shadow Council' })).toBeVisible();

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Power is offered in a cup that remembers' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Durotan', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mannoroth', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A bright city falls beneath a wounded sky' })).toBeVisible();
  await expect(page.locator('.battle-playback')).toHaveCount(0);

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The road does not cross a map—it leaves a world' })).toBeVisible();
  await expect(page.locator('.map-caption')).toContainText('INTERPRETIVE FIRST WAR CAMPAIGN STATE');
  await expect(page.getByRole('button', { name: 'Medivh', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'The Dark Portal', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Previous', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A bright city falls beneath a wounded sky' })).toBeVisible();
  await expect(page.locator('.map-caption')).toContainText('INTERPRETIVE DRAENOR WAR AND CORRUPTION STATE');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('.map-caption')).toContainText('INTERPRETIVE FIRST WAR CAMPAIGN STATE');

  for (let index = 0; index < 4; index += 1) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'Seven inheritances become one wartime promise' })).toBeVisible();
  await expect(page.locator('.map-caption')).toContainText('INTERPRETIVE SECOND WAR CAMPAIGN STATE');
  await expect(page.locator('.map-subject-visual').filter({ hasText: 'The Alliance of Lordaeron' })).toBeVisible();

  for (let index = 0; index < 3; index += 1) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'At Blackrock, loss becomes a summons' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Anduin Lothar', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Turalyon', exact: true })).toBeVisible();
  await expect(page.locator('.battle-playback')).toHaveCount(0);

  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The gate falls, but the road remains in memory' })).toBeVisible();
});

test('landing page full tour chains every completed guided era', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /the full history/i })).toBeVisible();
  await expect(page.locator('.landing-still')).toHaveCount(7);
  await page.getByRole('button', { name: /full tour of the history/i }).click();

  await expect(page).toHaveURL(/map\?era=cosmic-origins&tour=full/);
  await expect(page.getByRole('heading', { name: 'Before time could be counted' })).toBeVisible();
  for (let index = 0; index < 8; index += 1) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'One world among the stars' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue the chronicle' }).click();

  await expect(page).toHaveURL(/map\?era=black-empire&tour=full/);
  await expect(page.getByRole('heading', { name: 'Before the empire' })).toBeVisible();
  for (let index = 0; index < 9; index += 1) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'A world awaiting the Ordering' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue the chronicle' }).click();

  await expect(page).toHaveURL(/map\?era=ordering-of-azeroth&tour=full/);
  await expect(page.getByRole('heading', { name: 'The world the keepers inherited' })).toBeVisible();
  for (let index = 0; index < 10; index += 1) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'The makers pass beyond the sky' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue the chronicle' }).click();

  await expect(page).toHaveURL(/map\?era=ancient-civilizations&tour=full/);
  await expect(page.getByRole('heading', { name: 'The ordered world begins to remember' })).toBeVisible();
  for (let index = 0; index < 11; index += 1) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'A queen at the edge of ruin' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue the chronicle' }).click();

  await expect(page).toHaveURL(/map\?era=war-of-the-ancients&tour=full/);
  await expect(page.getByRole('heading', { name: 'The empire stands beneath its last unbroken sky' })).toBeVisible();
  for (let index = 0; index < 11; index += 1) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'Survivors carry the old world toward Hyjal' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue the chronicle' }).click();

  await expect(page).toHaveURL(/map\?era=long-vigil-new-kingdoms&tour=full/);
  await expect(page.getByRole('heading', { name: 'The broken world waits for new promises' })).toBeVisible();
  for (let index = 0; index < 13; index += 1) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'Many realms stand before an unopened gate' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue the chronicle' }).click();

  await expect(page).toHaveURL(/map\?era=rise-of-the-horde&tour=full/);
  await expect(page.getByRole('heading', { name: 'Draenor holds more than one remembered home' })).toBeVisible();
  for (let index = 0; index < 14; index += 1) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'The gate falls, but the road remains in memory' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue the chronicle' }).click();

  await expect(page).toHaveURL(/\?tour=complete$/);
  await expect(page.getByRole('status')).toContainText('edge of the current chronicle');
});
