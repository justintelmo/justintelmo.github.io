import { expect, test } from '@playwright/test';

const STUDIOS = ['The Game Band', 'Pixelberry Studios', 'EA / Glu Mobile', 'KIXEYE', 'Big Fish Games'];

test('experience has one row per job, newest first', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#experience .stop h3')).toHaveText(STUDIOS);
});

test('every row shows its role and dates, with no story', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#experience .stop').first().locator('.meta')).toHaveText(
    'Senior Back-End & Full-Stack Engineer · Apr 2024 – Feb 2026',
  );
  await expect(page.locator('#experience .story')).toHaveCount(0);
});

test('every row links each of its games by title to its game page', async ({ page }) => {
  await page.goto('/');
  const gameBand = page.locator('#experience .stop').first().locator('a');
  await expect(gameBand).toHaveText(["Dead Man's Party: A Knives Out Game", 'Unreleased Title']);
  const hrefs = await page.locator('#experience .stop a').evaluateAll((links) => links.map((a) => a.getAttribute('href')!));
  expect(hrefs.length).toBeGreaterThanOrEqual(STUDIOS.length);
  for (const href of hrefs) {
    expect(href).toMatch(/^\/games\/[a-z0-9-]+\/$/);
    const response = await page.goto(href);
    expect(response?.status()).toBe(200);
  }
});
