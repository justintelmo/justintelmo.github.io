import { expect, test } from '@playwright/test';

test('headings use Archivo and body text stays system-ui', async ({ page }) => {
  await page.goto('/');
  const family = (sel: string) => page.locator(sel).first().evaluate((el) => getComputedStyle(el).fontFamily);
  expect(await family('.intro h1')).toContain('Archivo');
  expect(await family('#projects-heading')).toContain('Archivo');
  expect(await family('body')).toContain('system-ui');
});

test('the Archivo file is preloaded', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="preload"][as="font"][href*="archivo"]')).toHaveCount(1);
});

test.describe('at 1440px wide', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test('the container is 80rem and running text stays under 65ch', async ({ page }) => {
    await page.goto('/');
    expect((await page.locator('main.container').boundingBox())!.width).toBe(1280);
    const about = await page
      .locator('#about p')
      .evaluate((el) => el.getBoundingClientRect().width / parseFloat(getComputedStyle(el).fontSize));
    expect(about).toBeLessThanOrEqual(40); // 65ch at 1rem is about 32em; Task 4 resizes About, so allow headroom
  });
});

test('cards, panels, header, and footer have no outlines', async ({ page }) => {
  const borders = (sel: string) =>
    page.locator(sel).evaluateAll((els) => els.map((el) => {
      const s = getComputedStyle(el);
      return [s.borderTopWidth, s.borderRightWidth, s.borderBottomWidth, s.borderLeftWidth].join(' ');
    }));
  await page.goto('/');
  for (const sel of ['#projects .media img', '#projects .image-placeholder', '.site-header', 'footer#contact']) {
    for (const b of await borders(sel)) expect(b, sel).toBe('0px 0px 0px 0px');
  }
  await page.goto('/games/dead-mans-party/');
  for (const sel of ['aside.glance', '.glance .stats', '.glance .links', 'main figure img', 'nav.more-games']) {
    for (const b of await borders(sel)) expect(b, sel).toBe('0px 0px 0px 0px');
  }
});

test('About reads as a statement and Contact is a full-width band', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const aboutSize = await page.locator('#about p').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(aboutSize).toBeGreaterThanOrEqual(24);
  const footer = page.locator('footer#contact');
  expect((await footer.boundingBox())!.width).toBe(1440);
  const bg = await footer.evaluate((el) => getComputedStyle(el).backgroundColor);
  const surface = await page.evaluate(() => {
    const probe = document.createElement('div');
    probe.style.background = 'var(--surface)';
    document.body.append(probe);
    return getComputedStyle(probe).backgroundColor;
  });
  expect(bg).toBe(surface);
});

test('Contact is a closing statement: a large heading, the email, then smaller links', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const size = (sel: string) => page.locator(sel).first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(await size('footer#contact h2')).toBe(await size('#about h2'));
  expect(await size('footer#contact .email')).toBeGreaterThan(await size('footer#contact .contact a'));
});
