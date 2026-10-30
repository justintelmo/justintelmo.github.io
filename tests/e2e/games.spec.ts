import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const GAMES = {
  'dead-mans-party': "Dead Man's Party: A Knives Out Game",
  'game-band-unreleased': 'Unreleased Title',
  storyloom: 'StoryLoom',
  'covet-fashion': 'Covet Fashion',
  'battle-pirates': 'Battle Pirates',
  'big-fish-casino': 'Big Fish Casino',
  'big-fish-bingo': 'Big Fish Bingo',
};

for (const [slug, title] of Object.entries(GAMES)) {
  test(`/games/${slug}/ shows ${title}`, async ({ page }) => {
    const response = await page.goto(`/games/${slug}/`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('main h1')).toHaveText(title);
    await expect(page).toHaveTitle(`${title} | Justin Telmo`);
  });
}

test('the header brand always shows on a game page, which has no hero', async ({ page }) => {
  await page.goto('/games/storyloom/');
  await expect(page.locator('.site-header .name')).toBeVisible();
});

test('the header nav on a game page leads back to home page sections', async ({ page }) => {
  await page.goto('/games/storyloom/');
  await page.locator('.site-header nav a', { hasText: 'Projects' }).click();
  await expect(page).toHaveURL(/\/#projects$/);
});

for (const theme of ['light', 'dark']) {
  test(`axe finds no WCAG A/AA violations on a game page in ${theme} mode`, async ({ page }) => {
    await page.goto('/games/dead-mans-party/');
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}
