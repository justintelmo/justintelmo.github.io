import { expect, test, type Page } from '@playwright/test';

const brand = '.site-header .name';

test.describe('with no motion preference', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('the header brand is hidden while the hero shows the name', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.intro h1')).toBeInViewport();
    // Without scroll-driven animations there is no hand-off, so the brand just shows.
    const scrollDriven = await page.evaluate(() => CSS.supports('animation-timeline: view()'));
    await expect(page.locator(brand)).toBeVisible({ visible: !scrollDriven });
  });

  test('the header brand appears once the hero scrolls away', async ({ page }) => {
    await page.goto('/#games');
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
  await page.goto('/#games');
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

const heroAvatar = '.intro .logo';
const headerAvatar = '.site-header .avatar';

// Scrolls without the page's smooth scrolling, then waits for the scroll-driven styles to catch up.
const scrollTo = (page: Page, top: number) =>
  page.evaluate(
    (y) =>
      new Promise((resolve) => {
        window.scrollTo({ top: y, behavior: 'instant' });
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }),
    top,
  );

// The flight ends once the hero's avatar-and-name row has slid fully under the header.
const flightEnd = (page: Page) =>
  page.evaluate(() => {
    const row = document.querySelector('.intro .top-row')!;
    const inset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop);
    return row.getBoundingClientRect().bottom + window.scrollY - inset;
  });

const opacity = (page: Page, sel: string) => page.locator(sel).evaluate((el) => Number(getComputedStyle(el).opacity));

for (const width of [390, 1280]) {
  test.describe(`at ${width}px with motion on, the avatar flies from the hero into the header`, () => {
    test.use({ viewport: { width, height: 900 }, reducedMotion: 'no-preference' });

    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);
      const scrollDriven = await page.evaluate(() => CSS.supports('animation-timeline: view()'));
      test.skip(!scrollDriven, 'needs scroll-driven animations');
    });

    test('at the top, only the hero avatar shows', async ({ page }) => {
      expect(await opacity(page, heroAvatar)).toBe(1);
      expect(await opacity(page, headerAvatar)).toBe(0);
    });

    test('at the end of the flight, the hero avatar sits exactly on the header avatar', async ({ page }) => {
      await scrollTo(page, await flightEnd(page));
      const hero = (await page.locator(heroAvatar).boundingBox())!;
      const header = (await page.locator(headerAvatar).boundingBox())!;
      for (const key of ['x', 'y', 'width', 'height'] as const) expect(hero[key], key).toBeCloseTo(header[key], 0);
    });

    test('past the flight, only the header avatar shows', async ({ page }) => {
      await scrollTo(page, (await flightEnd(page)) + 200);
      expect(await opacity(page, heroAvatar)).toBe(0);
      expect(await opacity(page, headerAvatar)).toBe(1);
    });
  });
}

test.describe('without scroll-driven animations', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('the hero avatar stays put at full size', async ({ page }) => {
    await page.goto('/');
    const scrollDriven = await page.evaluate(() => CSS.supports('animation-timeline: view()'));
    test.skip(scrollDriven, 'covered by the flight tests');
    await scrollTo(page, 150);
    const logo = page.locator(heroAvatar);
    expect(await logo.evaluate((el) => getComputedStyle(el).transform)).toBe('none');
    expect((await logo.boundingBox())!.width).toBe(96);
  });
});
