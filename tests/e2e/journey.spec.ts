import { expect, test } from '@playwright/test';

const STUDIOS = ['Big Fish Games', 'KIXEYE', 'EA / Glu Mobile', 'Pixelberry Studios', 'The Game Band'];

test('the journey has one stop per job, oldest first', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#journey .stop h3')).toHaveText(STUDIOS);
});

test('every stop has a story paragraph', async ({ page }) => {
  await page.goto('/');
  const stops = page.locator('#journey .stop');
  await expect(stops).toHaveCount(STUDIOS.length);
  for (const stop of await stops.all()) {
    await expect(stop.locator('.story p').first()).not.toBeEmpty();
  }
});

test('every "See" link scrolls its project into view', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('#journey .stop a[href^="#"]');
  const count = await links.count();
  expect(count).toBeGreaterThanOrEqual(STUDIOS.length);
  for (let i = 0; i < count; i++) {
    const link = links.nth(i);
    const href = (await link.getAttribute('href'))!;
    expect(href).toMatch(/^#(project|archive)-/);
    await link.click();
    await expect(page.locator(href)).toBeInViewport();
  }
});
