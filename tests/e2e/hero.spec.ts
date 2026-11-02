import { expect, test, type Page } from '@playwright/test';

const ART = [
  ["Dead Man's Party", '/games/dead-mans-party/'],
  ['StoryLoom', '/games/storyloom/'],
  ['Covet Fashion', '/games/covet-fashion/'],
  ['Battle Pirates', '/games/battle-pirates/'],
];

test('the art stack links four games to their pages', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('.intro .art a');
  await expect(links).toHaveCount(4);
  for (const [i, [, href]] of ART.entries()) {
    await expect(links.nth(i)).toHaveAttribute('href', href);
    expect((await links.nth(i).locator('img').getAttribute('alt'))?.trim()).toBeTruthy();
  }
});

test('the name is display size at 1440px', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const size = await page.locator('.intro h1').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(size).toBeGreaterThanOrEqual(112); // about 8vw at 1440
});

for (const width of [768, 1024]) {
  test(`at ${width}px the art does not cover the name or tagline`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const art = (await page.locator('.intro .art').boundingBox())!;
    for (const sel of ['.intro h1', '.intro .tagline']) {
      const box = (await page.locator(sel).boundingBox())!;
      const overlaps = art.x < box.x + box.width && box.x < art.x + art.width && art.y < box.y + box.height && box.y < art.y + art.height;
      expect(overlaps, sel).toBe(false);
    }
  });
}

test.describe('on a phone with motion on', () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' });

  // Stacked below the contact links, a drifting card could slide over them and take their taps.
  test('the art never rises over the contact links while scrolling', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(800); // let the entrance finish
    for (let y = 0; y <= 900; y += 100) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      const gap = await page.evaluate(() => {
        const contact = document.querySelector('.intro .contact')!.getBoundingClientRect().bottom;
        const cards = [...document.querySelectorAll('.intro .art a')].map((a) => a.getBoundingClientRect().top);
        return Math.min(...cards) - contact;
      });
      expect(gap, `scrolled to ${y}`).toBeGreaterThanOrEqual(0);
    }
  });
});

// The stacking order never changes. A raised card would cover its neighbors and keep the pointer
// until it left the whole card, so hovering across the fan felt different in each direction.
for (const width of [390, 1280]) {
  test.describe(`at ${width}px with motion on, the fan keeps its stacking order`, () => {
    test.use({ viewport: { width, height: 900 }, reducedMotion: 'no-preference' });

    const zIndexes = (page: Page) =>
      page.locator('.intro .art li').evaluateAll((lis) => lis.map((li) => getComputedStyle(li).zIndex));
    // translate(x, lift) rotate(r) leaves the lift in the matrix's last value.
    const lift = (page: Page, i: number) =>
      page.locator('.intro .art a').nth(i).evaluate((a) => Math.round(new DOMMatrix(getComputedStyle(a).transform).f));

    test('while hovering each card in turn', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(800); // let the entrance finish
      for (const i of [0, 1, 2, 3, 2, 1, 0]) {
        // Aim at a point where this card is the one on top.
        const point = await page.locator('.intro .art a').nth(i).evaluate((a) => {
          const box = a.getBoundingClientRect();
          for (let fx = 0.95; fx > 0; fx -= 0.05) {
            const x = box.left + box.width * fx;
            const y = box.top + box.height / 2;
            if (document.elementFromPoint(x, y)?.closest('a') === a) return { x, y };
          }
          return null;
        });
        expect(point, `card ${i} has a visible spot`).not.toBeNull();
        await page.mouse.move(point!.x, point!.y);
        await expect.poll(() => lift(page, i), `card ${i} lifts`).toBe(-12);
        expect(await zIndexes(page), `hovering card ${i}`).toEqual(['4', '3', '2', '1']);
      }
    });

    test('while tabbing through the cards', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(800);
      await page.locator('.intro .contact a').last().focus();
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press('Tab');
        await expect(page.locator('.intro .art a').nth(i)).toBeFocused();
        await expect.poll(() => lift(page, i), `card ${i} lifts`).toBe(-12);
        expect(await zIndexes(page), `focusing card ${i}`).toEqual(['4', '3', '2', '1']);
      }
    });
  });
}
