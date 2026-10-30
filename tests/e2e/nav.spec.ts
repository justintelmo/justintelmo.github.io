import { expect, test, type Page } from '@playwright/test';

const SECTIONS = [
  { label: 'About', id: 'about' },
  { label: 'Projects', id: 'projects' },
  { label: 'Experience', id: 'experience' },
  { label: 'Skills', id: 'skills' },
  { label: 'Contact', id: 'contact' },
];

const navLinks = (page: Page) => page.locator('.site-header nav a');

test('the nav links to every section, in page order', async ({ page }) => {
  await page.goto('/');
  await expect(navLinks(page)).toHaveText(SECTIONS.map((s) => s.label));
  const hrefs = await navLinks(page).evaluateAll((links) => links.map((a) => a.getAttribute('href')));
  // Rooted at "/" so the same nav works from pages other than home.
  expect(hrefs).toEqual(SECTIONS.map((s) => `/#${s.id}`));
});

test('the header has a resume button', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.site-header').getByRole('link', { name: 'Resume' })).toHaveAttribute('href', '/resume.pdf');
});

test('the hero offers resume and contact buttons', async ({ page }) => {
  await page.goto('/');
  const actions = page.locator('.intro .actions a');
  await expect(actions).toHaveText(['Resume', 'Contact']);
  expect(await actions.evaluateAll((links) => links.map((a) => a.getAttribute('href')))).toEqual([
    '/resume.pdf',
    '/#contact',
  ]);
});

test('the header stays on screen after scrolling', async ({ page }) => {
  await page.goto('/');
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await expect(page.locator('.site-header')).toBeInViewport();
  expect((await page.locator('.site-header').boundingBox())!.y).toBe(0);
});

for (const viewport of [
  { width: 1280, height: 800 },
  { width: 320, height: 568 },
]) {
  test.describe(`at ${viewport.width}px wide`, () => {
    test.use({ viewport });

    test('each nav link lands its heading just below the header', async ({ page }) => {
      await page.goto('/');
      for (const { label, id } of SECTIONS) {
        await navLinks(page).getByText(label, { exact: true }).click();
        const heading = page.locator(`#${id} h2`);
        await expect(heading).toBeInViewport();
        const headerBottom = await page.locator('.site-header').evaluate((el) => el.getBoundingClientRect().bottom);
        // Poll because smooth scrolling may still be moving.
        await expect.poll(async () => (await heading.boundingBox())!.y).toBeGreaterThanOrEqual(headerBottom);
      }
    });

    test('nav controls are at least 44px tall', async ({ page }) => {
      await page.goto('/');
      const controls = page.locator('.site-header a, .site-header button');
      for (const height of await controls.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height))) {
        expect(height).toBeGreaterThanOrEqual(44);
      }
    });
  });
}

test('the nav marks the section on screen as current', async ({ page }) => {
  await page.goto('/');
  for (const { label } of SECTIONS) {
    await navLinks(page).getByText(label, { exact: true }).click();
    await expect(page.locator('.site-header nav a[aria-current="location"]')).toHaveText([label]);
  }
});

test('scrolling to the bottom by hand marks Contact as current', async ({ page }) => {
  await page.goto('/');
  await page.mouse.wheel(0, 100_000);
  await expect(page.locator('.site-header nav a[aria-current="location"]')).toHaveText(['Contact']);
});

test('nothing is marked current at the top of the page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#theme-toggle')).toBeVisible();
  await expect(page.locator('.site-header nav a[aria-current]')).toHaveCount(0);
});
