import { expect, test } from '@playwright/test';

test('sections appear in page order', async ({ page }) => {
  await page.goto('/');
  const selectors = ['.intro', '#games', '#skills', 'footer'];
  const tops: number[] = [];
  for (const selector of selectors) {
    const box = await page.locator(selector).boundingBox();
    expect(box, `${selector} should render`).not.toBeNull();
    tops.push(box!.y);
  }
  expect(tops).toEqual([...tops].sort((a, b) => a - b));
});

test('section headings use the names recruiters scan for', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main h2')).toHaveText(['Games', 'Skills']);
});
