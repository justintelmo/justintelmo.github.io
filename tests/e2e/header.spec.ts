import { expect, test } from '@playwright/test';

const CONTACT_HREFS = [
  'https://www.linkedin.com/in/justin-telmo',
  'mailto:justin.telmo@gmail.com',
  'https://github.com/justintelmo',
  '/resume.pdf',
];
// The hero's Resume button already covers the PDF, so its contact links leave it out.
const HERO_HREFS = CONTACT_HREFS.slice(0, 3);

test('the hero names Justin', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.intro h1')).toHaveText('Justin Telmo');
});

test('the hero offers a resume button, then the contact links', async ({ page }) => {
  await page.goto('/');
  const actions = page.locator('.intro .actions a');
  await expect(actions.first()).toHaveAccessibleName('Resume (PDF, opens in a new tab)');
  expect(await actions.evaluateAll((links) => links.map((a) => a.getAttribute('href')))).toEqual(['/resume.pdf', ...HERO_HREFS]);
});

test.describe('with motion settled', () => {
  // The hero's rise-in entrance translates the links, which makes their rect height fractional mid-animation.
  test.use({ reducedMotion: 'reduce' });

  test('every contact link is at least 44px tall', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('.intro .contact a');
    await expect(links).toHaveCount(HERO_HREFS.length);
    for (const box of await links.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height))) {
      expect(box).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe('at 320px wide', () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test('the theme toggle does not overlap the name in the header', async ({ page }) => {
    await page.goto('/');
    const toggle = (await page.locator('#theme-toggle').boundingBox())!;
    const name = (await page.locator('.site-header .name').boundingBox())!;
    const overlaps =
      toggle.x < name.x + name.width &&
      name.x < toggle.x + toggle.width &&
      toggle.y < name.y + name.height &&
      name.y < toggle.y + toggle.height;
    expect(overlaps).toBe(false);
  });
});

// The footer leaves Resume out because the header already shows it.
test('the footer is the contact section, with the email as text and the contact links', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer#contact');
  await expect(footer.getByRole('heading', { level: 2 })).toHaveText('Contact');
  await expect(footer.locator('p')).not.toBeEmpty();
  await expect(footer.locator('.email')).toHaveText('justin.telmo@gmail.com');
  const hrefs = await page.locator('footer a').evaluateAll((links) => links.map((a) => a.getAttribute('href')));
  expect(hrefs).toEqual(HERO_HREFS);
});
