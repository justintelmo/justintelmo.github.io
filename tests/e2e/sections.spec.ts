import { expect, test } from '@playwright/test';

const GROUPS = ['Languages', 'Frameworks', 'Data', 'Infrastructure'];

test('sections appear in page order', async ({ page }) => {
  await page.goto('/');
  const selectors = ['header.intro', '#about', '#projects', '#experience', '#skills', 'footer'];
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
  await expect(page.locator('main h2')).toHaveText(['About', 'Projects', 'Experience', 'Skills']);
});

test('the skills section shows every skill group', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#skills h3')).toHaveText(GROUPS);
});

test('the skills section has no skill bars or percentages', async ({ page }) => {
  await page.goto('/');
  const toolbox = page.locator('#skills');
  await expect(toolbox).toBeVisible();
  await expect(toolbox.locator('progress, meter')).toHaveCount(0);
  await expect(toolbox).not.toContainText('%');
});

test('the about section has a paragraph', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#about p')).not.toBeEmpty();
});
