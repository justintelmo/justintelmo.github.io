import { expect, test, type Page } from '@playwright/test';

// Browsers without scroll-driven animations (Firefox, as of 157) skip the @supports block and show everything as-is.
const scrollDriven = (page: Page) => page.evaluate(() => CSS.supports('animation-timeline: view()'));

const style = (selector: string, property: string) =>
  `getComputedStyle(document.querySelector('${selector}')).getPropertyValue('${property}')`;

test.describe('with no motion preference', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('in-page jumps scroll smoothly', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(style('html', 'scroll-behavior'))).toBe('smooth');
  });

  test('sections fade in as they scroll into view', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(style('#skills', 'animation-name'))).toBe((await scrollDriven(page)) ? 'reveal' : 'none');
  });

  test('a section is fully visible once scrolled to', async ({ page }) => {
    await page.goto('/');
    await page.locator('.site-header nav a', { hasText: 'Skills' }).click();
    await expect.poll(() => page.evaluate(style('#skills', 'opacity'))).toBe('1');
  });
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('jumps are instant and nothing fades', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(style('html', 'scroll-behavior'))).toBe('auto');
    expect(await page.evaluate(style('#skills', 'animation-name'))).toBe('none');
    expect(await page.evaluate(style('#skills', 'opacity'))).toBe('1');
  });

  test('nothing is animating', async ({ page }) => {
    await page.goto('/');
    const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
    expect(running).toBe(0);
  });
});
