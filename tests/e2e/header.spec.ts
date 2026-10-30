import { expect, test } from '@playwright/test';

const CONTACT_HREFS = [
  'mailto:justin.telmo@gmail.com',
  'https://www.linkedin.com/in/justin-telmo',
  'https://github.com/justintelmo',
  '/resume.pdf',
];

test('the intro header names Justin', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('header h1')).toHaveText('Justin Telmo');
});

test('the intro header links to every contact channel', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('header .contact a').evaluateAll((links) => links.map((a) => a.getAttribute('href')));
  expect(hrefs).toEqual(CONTACT_HREFS);
});

test('every contact link is at least 44px tall', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('header .contact a');
  await expect(links).toHaveCount(CONTACT_HREFS.length);
  for (const box of await links.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height))) {
    expect(box).toBeGreaterThanOrEqual(44);
  }
});

test.describe('at 320px wide', () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test('the theme toggle does not overlap the name', async ({ page }) => {
    await page.goto('/');
    const toggle = (await page.locator('#theme-toggle').boundingBox())!;
    const name = (await page.locator('header h1').boundingBox())!;
    const overlaps =
      toggle.x < name.x + name.width &&
      name.x < toggle.x + toggle.width &&
      toggle.y < name.y + name.height &&
      name.y < toggle.y + toggle.height;
    expect(overlaps).toBe(false);
  });
});

test('the footer is the contact section', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer#contact');
  await expect(footer.getByRole('heading', { level: 2 })).toHaveText('Contact');
  await expect(footer.locator('p')).not.toBeEmpty();
});

test('the footer repeats the contact links', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('footer a').evaluateAll((links) => links.map((a) => a.getAttribute('href')));
  expect(hrefs).toEqual(CONTACT_HREFS);
});
