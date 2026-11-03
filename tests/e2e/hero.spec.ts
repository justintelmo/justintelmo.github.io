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
  for (const [i, [title, href]] of ART.entries()) {
    await expect(links.nth(i)).toHaveAttribute('href', href);
    await expect(links.nth(i)).toHaveAccessibleName(new RegExp(title));
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
        // Aim at the middle of the strip where this card is on top. Near its edge, the spreading fan
        // slides the card out from under the pointer, and Firefox moves hover to the next card.
        const point = await page.locator('.intro .art a').nth(i).evaluate((a) => {
          const box = a.getBoundingClientRect();
          const y = box.top + box.height / 2;
          const xs: number[] = [];
          for (let fx = 0.95; fx > 0; fx -= 0.05) {
            const x = box.left + box.width * fx;
            if (document.elementFromPoint(x, y)?.closest('a') === a) xs.push(x);
          }
          return xs.length ? { x: xs[Math.floor(xs.length / 2)], y } : null;
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

test('the tagline and buttons are set in Archivo, the facts line is not', async ({ page }) => {
  await page.goto('/');
  const font = (sel: string) => page.locator(sel).first().evaluate((el) => getComputedStyle(el).fontFamily);
  expect(await font('.intro .tagline')).toContain('Archivo');
  expect(await font('.intro .button')).toContain('Archivo');
  expect(await font('.site-header .button')).toContain('Archivo');
  expect(await font('.intro .facts')).not.toContain('Archivo');
});

test('the hero has one button, the Resume, and no arrows', async ({ page }) => {
  await page.goto('/');
  const buttons = page.locator('.intro .button');
  await expect(buttons).toHaveCount(1);
  await expect(buttons).toHaveAttribute('href', '/resume.pdf');
  await expect(page.locator('.intro').getByRole('link', { name: 'Contact', exact: true })).toHaveCount(0);
  const text = await page.locator('.intro').textContent();
  expect(text).not.toMatch(/[↓→]/);
});

test('a game page offers the Resume button and contact links, with no arrows', async ({ page }) => {
  await page.goto('/games/storyloom/');
  const talk = page.locator('main .talk');
  await expect(talk.locator('.button')).toHaveCount(1);
  await expect(talk.locator('.button')).toHaveAttribute('href', '/resume.pdf');
  expect(await talk.locator('.contact a').evaluateAll((links) => links.map((a) => a.getAttribute('href')))).toEqual([
    'https://www.linkedin.com/in/justin-telmo',
    'mailto:justin.telmo@gmail.com',
    'https://github.com/justintelmo',
  ]);
  expect(await talk.textContent()).not.toMatch(/[↓→]/);
});

// The header, hero, and game pages all link the PDF (the footer leaves it to the header). Each opens in a new tab and says so.
for (const path of ['/', '/games/storyloom/']) {
  test(`every resume link on ${path} opens the PDF in a new tab`, async ({ page }) => {
    await page.goto(path);
    const links = page.locator('a[href="/resume.pdf"]');
    expect(await links.count()).toBeGreaterThanOrEqual(2);
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
      await expect(link).toHaveAccessibleName(/^Resume.*new tab/);
    }
  });
}

test.describe('button hover with motion on', () => {
  test.use({ reducedMotion: 'no-preference' });

  // The header's compact Resume is the outlined button left on the page.
  test('an outlined button lifts and its fill sweeps in', async ({ page }) => {
    await page.goto('/');
    const resume = page.locator('.site-header .button');
    await page.waitForTimeout(800); // let the entrance finish
    await resume.hover();
    await expect.poll(() => resume.evaluate((a) => new DOMMatrix(getComputedStyle(a).transform).f)).toBe(-1);
    await expect
      .poll(() => resume.evaluate((a) => getComputedStyle(a, '::before').transform))
      .toBe('matrix(1, 0, 0, 1, 0, 0)');
  });
});

test.describe('button hover with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the buttons do not move', async ({ page }) => {
    await page.goto('/');
    for (const selector of ['.intro .button', '.site-header .button']) {
      const button = page.locator(selector);
      await button.hover();
      await page.waitForTimeout(300);
      expect(await button.evaluate((a) => getComputedStyle(a).transform), selector).toBe('none');
    }
  });
});
