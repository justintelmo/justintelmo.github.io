import { expect, test, type Page } from '@playwright/test';

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
  test('the container is 80rem', async ({ page }) => {
    await page.goto('/');
    expect((await page.locator('main.container').boundingBox())!.width).toBe(1280);
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

test('Contact is a full-width band', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
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
  const size = (page: Page, sel: string) => page.locator(sel).first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  // The clamp's 3.25rem cap hides a mismatch at 1440, so compare at a phone width too.
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    expect(await size(page, 'footer#contact h2'), `h2 at ${width}px`).toBe(await size(page, '#projects h2'));
  }
  expect(await size(page, 'footer#contact .email')).toBeGreaterThan(await size(page, 'footer#contact .contact a'));
});

// Six steps in all: small, body, lead, subheading, section heading, display. The clamps resolve to
// one value at a given width, so each page at each width should show six sizes at most.
for (const path of ['/', '/games/dead-mans-party/', '/games/game-band-unreleased/']) {
  test(`${path} uses at most six type sizes`, async ({ page }) => {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      const sizes = await page.evaluate(() => {
        const found = new Map<string, string>();
        for (const el of document.querySelectorAll('body *')) {
          // The PDF tag is a badge sized to its button, not a step in the scale.
          if (el.closest('.tag') || !el.checkVisibility()) continue;
          const hasText = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim());
          const size = getComputedStyle(el).fontSize;
          if (hasText && !found.has(size)) found.set(size, el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ')[0] : ''));
        }
        return [...found].map(([size, example]) => `${size} (${example})`);
      });
      expect(sizes.length, `${width}px: ${sizes.join(', ')}`).toBeLessThanOrEqual(6);
    }
  });
}
