import { expect, test } from '@playwright/test';
import { skillGroups } from '../../src/data/skills';

const SKILLS = skillGroups.flatMap((g) => g.items);

test('the chart has one row per skill, in the listed order', async ({ page }) => {
  await page.goto('/');
  const names = await page.locator('#skills .skill .name').evaluateAll((els) => els.map((el) => el.firstChild!.textContent!.trim()));
  expect(names).toEqual(SKILLS);
});

test('every skill has at least one bar, so each one is backed by a game', async ({ page }) => {
  await page.goto('/');
  for (const [i, row] of (await page.locator('#skills .skill').all()).entries()) {
    expect(await row.locator('.bar').count(), SKILLS[i]).toBeGreaterThan(0);
  }
});

test('each row tells screen readers the years and games', async ({ page }) => {
  await page.goto('/');
  const php = page.locator('#skills .skill', { hasText: /^PHP,/ });
  await expect(php.locator('.name')).toHaveText(/^PHP, 2013 – 2022, on .*Big Fish Bingo.*Covet Fashion/);
  await expect(php.locator('.track')).toHaveAttribute('aria-hidden', 'true');
});

test('bars line up with the year axis', async ({ page }) => {
  await page.goto('/');
  // Kotlin starts at Covet Fashion, Oct 2018: just left of the 2019 tick.
  const kotlin = (await page.locator('#skills .skill', { hasText: /^Kotlin,/ }).locator('.bar').first().boundingBox())!;
  const tick2019 = (await page.locator('#skills .tick', { hasText: '2019' }).boundingBox())!;
  expect(kotlin.x).toBeLessThan(tick2019.x);
  expect(kotlin.x).toBeGreaterThan(tick2019.x - 30);
});

test('the chart fits a phone screen without sideways scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
});
