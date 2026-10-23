import { expect, test } from '@playwright/test';

const FEATURED_COUNT = 7;
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

test('every card names its platforms', async ({ page }) => {
  await page.goto('/');
  const platforms = page.locator('#projects article .platforms');
  await expect(platforms).toHaveCount(FEATURED_COUNT);
  for (const line of await platforms.all()) {
    await expect(line).not.toBeEmpty();
  }
});

test('a card shows the launch year when it is known', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#project-big-fish-casino .platforms')).toHaveText('iOS, Android, Facebook · Launched 2012');
  await expect(page.locator('#project-big-fish-bingo .platforms')).toHaveText('iOS, Android');
});

test('there is no archive table', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#archive, #projects table')).toHaveCount(0);
});
