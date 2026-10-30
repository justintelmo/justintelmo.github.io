import { expect, test } from '@playwright/test';

test.describe('at 320x568', () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test('the page never scrolls sideways', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  });

  test('the contact links are within one scroll of the top', async ({ page }) => {
    await page.goto('/');
    const box = (await page.locator('.intro .contact a').last().boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(568 * 2);
  });
});

test.describe('at 1280x800', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('the intro and the first project start above the fold', async ({ page }) => {
    await page.goto('/');
    for (const selector of ['.intro .tagline', '.intro .facts', '.intro .contact']) {
      const box = (await page.locator(selector).boundingBox())!;
      expect(box.y + box.height, selector).toBeLessThanOrEqual(800);
    }
    const first = (await page.locator('#projects article').first().boundingBox())!;
    expect(first.y).toBeLessThanOrEqual(800);
  });
});
