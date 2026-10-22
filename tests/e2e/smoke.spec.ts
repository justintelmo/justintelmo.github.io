import { expect, test } from '@playwright/test';

test('home page has the site title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Justin Telmo/);
});
