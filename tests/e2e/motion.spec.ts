import { expect, test } from '@playwright/test';

const style = (selector: string, property: string) =>
  `getComputedStyle(document.querySelector('${selector}')).getPropertyValue('${property}')`;

test.describe('with no motion preference', () => {
  test.use({ reducedMotion: 'no-preference' });

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
