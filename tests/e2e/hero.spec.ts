import { expect, test } from '@playwright/test';

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
