import { expect, test } from '@playwright/test';
import { skillGroups } from '../../src/data/skills';
import { byYears, formatYears } from '../../src/lib/skills';

test('each group lists its skills with their years, most first', async ({ page }) => {
  await page.goto('/');
  const groups = page.locator('#skills .group');
  await expect(groups).toHaveCount(skillGroups.length);
  for (const [i, { name, items }] of skillGroups.entries()) {
    const group = groups.nth(i);
    await expect(group.locator('h3')).toHaveText(name);
    const sorted = byYears(items);
    await expect(group.locator('li .name')).toHaveText(sorted.map((s) => s.name));
    await expect(group.locator('li .years')).toHaveText(sorted.map(formatYears));
  }
});

test('every skill has at least a year', () => {
  for (const skill of skillGroups.flatMap((g) => g.items)) expect(skill.years, skill.name).toBeGreaterThanOrEqual(1);
});

test('the groups sit side by side on a wide screen', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const tops = await page.locator('#skills .group').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
  expect(new Set(tops).size).toBe(1);
});

test('the list fits a phone screen without sideways scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
});
