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
  test(`/games/${slug}/ shows ${title} and its case study`, async ({ page }) => {
    const response = await page.goto(`/games/${slug}/`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('main h1')).toHaveText(title);
    await expect(page).toHaveTitle(`${title} | Justin Telmo`);
    await expect(page.locator('.case-study h2').first()).toHaveText('Key features');
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

test('every game page has an at-a-glance panel with studio, role, dates, platforms, and tech', async ({ page }) => {
  for (const slug of Object.keys(GAMES)) {
    await page.goto(`/games/${slug}/`);
    const glance = page.getByRole('complementary', { name: 'At a glance' });
    for (const term of ['Studio', 'Role', 'Dates', 'Platforms', 'Tech']) {
      await expect(glance.locator('dt', { hasText: new RegExp(`^${term}$`) }), `${slug} ${term}`).toHaveCount(1);
    }
  }
});

test('the panel shows the launch year only when it is known', async ({ page }) => {
  await page.goto('/games/big-fish-casino/');
  await expect(page.locator('.glance dt', { hasText: 'Launched' }).locator('+ dd')).toHaveText('2012');
  await page.goto('/games/big-fish-bingo/');
  await expect(page.locator('.glance dt', { hasText: 'Launched' })).toHaveCount(0);
});

test('every stat names its year and links its source', async ({ page }) => {
  await page.goto('/games/covet-fashion/');
  const stats = page.locator('.glance .stat');
  expect(await stats.count()).toBeGreaterThan(0);
  for (const stat of await stats.all()) {
    await expect(stat).toContainText(/\b\d{4}\b/);
    await expect(stat.locator('a[href^="http"]')).toHaveCount(1);
  }
});

test('the summary sits under the title as a lede', async ({ page }) => {
  await page.goto('/games/storyloom/');
  await expect(page.locator('main .lede')).not.toBeEmpty();
});

test('every released game page shows its image with alt text and a credit link', async ({ page }) => {
  for (const slug of Object.keys(GAMES).filter((s) => s !== 'game-band-unreleased')) {
    await page.goto(`/games/${slug}/`);
    const img = page.locator('main .hero img');
    await expect(img, slug).toHaveCount(1);
    expect((await img.getAttribute('alt'))?.trim(), slug).toBeTruthy();
    await expect(page.locator('main .hero figcaption a[href^="http"]'), slug).toHaveCount(1);
  }
});

test('the unreleased game page is text only with no outside links', async ({ page }) => {
  await page.goto('/games/game-band-unreleased/');
  await expect(page.locator('main .image-placeholder')).toHaveText('Unreleased');
  await expect(page.locator('main img')).toHaveCount(0);
  // The contact links at the bottom are Justin's own, not the game's.
  await expect(page.locator('main a[href^="http"]:not(.talk a)')).toHaveCount(0);
});

for (const [slug, theme] of [['dead-mans-party', 'light'], ['dead-mans-party', 'dark'], ['game-band-unreleased', 'light'], ['game-band-unreleased', 'dark']]) {
  test(`axe finds no WCAG A/AA violations on /games/${slug}/ in ${theme} mode`, async ({ page }) => {
    await page.goto(`/games/${slug}/`);
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}

test('previous and next follow the home page order without wrapping', async ({ page }) => {
  const slugs = Object.keys(GAMES);
  for (const [i, slug] of slugs.entries()) {
    await page.goto(`/games/${slug}/`);
    const nav = page.getByRole('navigation', { name: 'More games' });
    const previous = nav.locator('a[rel="prev"]');
    const next = nav.locator('a[rel="next"]');
    if (i === 0) await expect(previous).toHaveCount(0);
    else await expect(previous).toHaveAttribute('href', `/games/${slugs[i - 1]}/`);
    if (i === slugs.length - 1) await expect(next).toHaveCount(0);
    else await expect(next).toHaveAttribute('href', `/games/${slugs[i + 1]}/`);
  }
});

test('previous and next links name their games', async ({ page }) => {
  await page.goto('/games/storyloom/');
  const nav = page.getByRole('navigation', { name: 'More games' });
  await expect(nav.locator('a[rel="prev"]')).toContainText(GAMES['game-band-unreleased']);
  await expect(nav.locator('a[rel="next"]')).toContainText(GAMES['covet-fashion']);
});

test('the bottom of a game page offers the resume and contact links', async ({ page }) => {
  await page.goto('/games/storyloom/');
  const bar = page.locator('main .talk');
  await expect(bar.getByRole('link', { name: /^Resume/ })).toHaveAttribute('href', '/resume.pdf');
  await expect(bar.getByRole('link', { name: 'Email' })).toHaveAttribute('href', 'mailto:justin.telmo@gmail.com');
});

test('the game image is never shown wider than its source', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const slug of ['dead-mans-party', 'covet-fashion']) {
    await page.goto(`/games/${slug}/`);
    const img = page.locator('main figure img').first();
    const [shown, natural] = await img.evaluate((el: HTMLImageElement) => [
      el.getBoundingClientRect().width,
      el.naturalWidth,
    ]);
    expect(shown).toBeLessThanOrEqual(natural);
  }
});

test('the title is in Archivo at display size', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/games/dead-mans-party/');
  const h1 = page.locator('main h1');
  expect(await h1.evaluate((el) => getComputedStyle(el).fontFamily)).toContain('Archivo');
  expect(await h1.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(48);
});

test('previous and next titles are set in the display font', async ({ page }) => {
  await page.goto('/games/storyloom/');
  const link = page.locator('.more-games a[rel="next"] .title');
  expect(await link.evaluate((el) => getComputedStyle(el).fontFamily)).toContain('Archivo');
  expect(await link.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(22);
});
