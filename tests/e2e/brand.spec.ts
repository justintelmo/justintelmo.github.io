import { expect, test } from '@playwright/test';

const brand = '.site-header .name';

test.describe('with no motion preference', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('the header brand is hidden while the hero shows the name', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.intro h1')).toBeInViewport();
    await expect(page.locator(brand)).toBeHidden();
  });

  test('the header brand appears once the hero scrolls away', async ({ page }) => {
    await page.goto('/#projects');
    await expect(page.locator(brand)).toBeVisible();
    await expect.poll(() => page.locator(brand).evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  });
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the header brand always shows', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(brand)).toBeVisible();
  });
});

test('the header brand pairs the avatar with the name and links home', async ({ page }) => {
  // Past the hero, where the brand is showing; hidden elements have no accessible name.
  await page.goto('/#projects');
  const link = page.locator(brand);
  await expect(link).toHaveAttribute('href', '/');
  await expect(link).toHaveAccessibleName('Justin Telmo');
  await expect(link.locator('img')).toHaveAttribute('alt', '');
});

test('the site has a favicon', async ({ page, request }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="icon"]').getAttribute('href');
  const response = await request.get(href!);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toMatch(/^image\//);
});
