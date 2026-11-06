import { expect, test } from '@playwright/test';

const FEATURED_COUNT = 7;
const NDA_ANCHOR = '#project-game-band-unreleased';

test('there is one card per featured project', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#games article')).toHaveCount(FEATURED_COUNT);
});

test('every non-NDA card has an image with alt text', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator(`#games article:not(${NDA_ANCHOR})`);
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
  const offsite = await card.locator('a').evaluateAll((links) =>
    links.map((a) => a.getAttribute('href') ?? '').filter((href) => /^https?:/.test(href)),
  );
  expect(offsite).toEqual([]);
});

test('every card has one link, named for its game, to its game page', async ({ page }) => {
  await page.goto('/');
  for (const card of await page.locator('#games article').all()) {
    const slug = (await card.getAttribute('id'))!.replace(/^project-/, '');
    const link = card.locator('a');
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute('href', `/games/${slug}/`);
    await expect(link).toHaveAccessibleName(await card.locator('h3').innerText());
  }
});

test('every card shows its role, studio, and summary', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#project-covet-fashion .role')).toHaveText('Server Software Engineer II · EA / Glu Mobile');
  for (const summary of await page.locator('#games article .summary').all()) {
    await expect(summary).not.toBeEmpty();
  }
  await expect(page.locator('#games article .summary')).toHaveCount(FEATURED_COUNT);
});

test('every card shows the years worked', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#project-covet-fashion .years')).toHaveText('2018 – 2022');
  await expect(page.locator('#games article .years')).toHaveCount(FEATURED_COUNT);
});

test('clicking anywhere on a card opens its game page', async ({ page }) => {
  await page.goto('/');
  // Top-left corner of the card is the image, well away from the title link's own text.
  await page.locator('#project-storyloom').click({ position: { x: 20, y: 20 } });
  await expect(page).toHaveURL(/\/games\/storyloom\/$/);
});

for (const [width, expected] of [[1440, 4], [900, 2], [390, 1]] as const) {
  test(`cards sit in ${expected} column(s) at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const tops = await page.locator('#games article').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
    expect(tops.filter((t) => t === tops[0]).length).toBe(expected);
  });
}

test('there is no archive table', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#archive, #games table')).toHaveCount(0);
});
