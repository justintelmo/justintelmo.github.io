import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const violations = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  return results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
};

test.describe('with reduced motion', () => {
  // Axe reads the blended color of a section caught mid scroll-fade, which is a transient, not a real contrast failure.
  test.use({ reducedMotion: 'reduce' });

  for (const theme of ['light', 'dark']) {
    test(`axe finds no WCAG A/AA violations in ${theme} mode`, async ({ page }) => {
      await page.goto('/');
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      expect(await violations(page)).toEqual([]);
    });
  }
});

test.describe('with motion on', () => {
  test.use({ reducedMotion: 'no-preference' });

  // Scrolled to the bottom, every section has faded in and the avatar has handed off to the header,
  // so axe sees the page as it ends up rather than mid-animation.
  for (const theme of ['light', 'dark']) {
    test(`axe finds no WCAG A/AA violations in ${theme} mode once everything has animated in`, async ({ page }) => {
      await page.goto('/');
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      await page.evaluate(async () => {
        const frame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const bottom = () => document.documentElement.scrollHeight - innerHeight;
        for (let y = 0; y < bottom(); y += innerHeight / 2) {
          window.scrollTo({ top: y, behavior: 'instant' });
          await frame();
        }
        window.scrollTo({ top: bottom(), behavior: 'instant' });
        await frame();
        // The hero's entrance and the theme's color transitions run on time, not scroll, and can outlast the
        // scroll above. Scroll-driven animations are left out: they never finish while the page sits still.
        await Promise.all(document.getAnimations().filter((a) => a.timeline === document.timeline).map((a) => a.finished));
      });
      await expect
        .poll(() => page.locator('main > section').evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity)))
        .toEqual(['1', '1', '1']);
      expect(await violations(page)).toEqual([]);
    });
  }
});
