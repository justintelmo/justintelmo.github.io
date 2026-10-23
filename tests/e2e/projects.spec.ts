import { expect, test } from '@playwright/test';

const FEATURED_COUNT = 6;
const PROJECT_COUNT = 7;
const NDA_ANCHOR = '#project-game-band-unreleased';

test('there is one card per featured project', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#projects article')).toHaveCount(FEATURED_COUNT);
});

test('every non-NDA card has an image with alt text', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator(`#projects article:not(${NDA_ANCHOR})`);
  await expect(cards).toHaveCount(FEATURED_COUNT - 1);
  for (const card of await cards.all()) {
    const img = card.locator('img');
    await expect(img).toHaveCount(1);
    expect((await img.getAttribute('alt'))?.trim()).toBeTruthy();
  }
});

test('the unreleased card is text only', async ({ page }) => {
  await page.goto('/');
  const card = page.locator(NDA_ANCHOR);
  await expect(card.locator('.image-placeholder')).toHaveText('Unreleased');
  await expect(card.locator('img')).toHaveCount(0);
  await expect(card.getByRole('heading', { name: 'What I did' })).toBeVisible();
  expect(await card.locator('.contributions li').count()).toBeGreaterThan(0);
  const offsite = await card.locator('a').evaluateAll((links) =>
    links.map((a) => a.getAttribute('href') ?? '').filter((href) => /^https?:/.test(href)),
  );
  expect(offsite).toEqual([]);
});

test('every stat names its year and links its source', async ({ page }) => {
  await page.goto('/');
  const stats = page.locator('#projects .stat');
  expect(await stats.count()).toBeGreaterThan(0);
  for (const stat of await stats.all()) {
    await expect(stat).toContainText(/\b\d{4}\b/);
    await expect(stat.locator('a[href^="http"]')).toHaveCount(1);
  }
});

test('the archive has a row per project', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#archive tbody tr')).toHaveCount(PROJECT_COUNT);
});

test('the NDA row says Not public and has no image', async ({ page }) => {
  await page.goto('/');
  const row = page.locator('#archive tbody tr', { hasText: 'Unreleased Title' });
  await expect(row).toHaveCount(1);
  await expect(row.locator('td').last()).toHaveText('Not public');
  await expect(row.locator('img, a')).toHaveCount(0);
});

for (const { width, visible } of [
  { width: 375, visible: false },
  { width: 1280, visible: true },
]) {
  test.describe(`at ${width}px wide`, () => {
    test.use({ viewport: { width, height: 800 } });

    test(`the extra archive columns are ${visible ? 'shown' : 'hidden'}`, async ({ page }) => {
      await page.goto('/');
      const cells = page.locator('#archive .col-extra');
      expect(await cells.count()).toBeGreaterThan(0);
      for (const cell of await cells.all()) {
        if (visible) await expect(cell).toBeVisible();
        else await expect(cell).toBeHidden();
      }
    });
  });
}
