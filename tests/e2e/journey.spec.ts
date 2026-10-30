import { expect, test } from '@playwright/test';

const STUDIOS = ['Big Fish Games', 'KIXEYE', 'EA / Glu Mobile', 'Pixelberry Studios', 'The Game Band'];

test('the journey has one stop per job, oldest first', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#experience .stop h3')).toHaveText(STUDIOS);
});

test('every stop has a story paragraph', async ({ page }) => {
  await page.goto('/');
  const stops = page.locator('#experience .stop');
  await expect(stops).toHaveCount(STUDIOS.length);
  for (const stop of await stops.all()) {
    await expect(stop.locator('.story p').first()).not.toBeEmpty();
  }
});

test('every "See" link opens its game page', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('#experience .stop .links a').evaluateAll((links) =>
    links.map((a) => a.getAttribute('href')!),
  );
  expect(hrefs.length).toBeGreaterThanOrEqual(STUDIOS.length);
  for (const href of hrefs) {
    expect(href).toMatch(/^\/games\/[a-z0-9-]+\/$/);
    const response = await page.goto(href);
    expect(response?.status()).toBe(200);
    await expect(page.locator('main h1')).not.toBeEmpty();
  }
});
