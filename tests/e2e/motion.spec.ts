import { expect, test, type Page } from '@playwright/test';

// Resolves a CSS custom property to the color the browser computes, so checks hold in both themes.
const token = (page: Page, name: string) =>
  page.evaluate((n) => {
    const probe = document.createElement('span');
    probe.style.color = `var(${n})`;
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, name);

const skillRows = (page: Page) => page.locator('#skills .skill');


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
    expect(await page.evaluate(style('#skills', 'animation-name'))).toBe('reveal');
  });

  test('a section is fully visible once scrolled to', async ({ page }) => {
    await page.goto('/');
    await page.locator('.site-header nav a', { hasText: 'Skills' }).click();
    await expect.poll(() => page.evaluate(style('#skills', 'opacity'))).toBe('1');
  });

  test('skill bars draw in and are fully drawn once scrolled to', async ({ page }) => {
    await page.goto('/');
    const bar = page.locator('#skills .bar').first();
    expect(await bar.evaluate((el) => getComputedStyle(el).animationName)).toBe('draw');
    await page.locator('.site-header nav a', { hasText: 'Skills' }).click();
    await expect.poll(() => bar.evaluate((el) => getComputedStyle(el).transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
  });

  test('hovering a skill highlights its row and dims the others', async ({ page }) => {
    await page.goto('/');
    await page.locator('.site-header nav a', { hasText: 'Skills' }).click();
    const rows = skillRows(page);
    const hovered = rows.nth(0);
    const other = rows.nth(1);
    await hovered.scrollIntoViewIfNeeded();
    const bar = hovered.locator('.bar').first();
    await expect.poll(() => bar.evaluate((el) => getComputedStyle(el).transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
    await hovered.hover();
    const magenta = await token(page, '--accent-magenta');
    await expect
      .poll(() => hovered.locator('.name').evaluate((el) => getComputedStyle(el).color))
      .toBe(magenta);
    await expect
      .poll(async () => Number(await other.locator('.bar').first().evaluate((el) => getComputedStyle(el).opacity)))
      .toBeCloseTo(0.35, 1);
    // scaleY(n) is matrix(1, 0, 0, n, 0, 0): thicker than at rest.
    await expect
      .poll(async () => Number((await bar.evaluate((el) => getComputedStyle(el).transform)).split(',')[3]))
      .toBeGreaterThan(1);
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

  test('hovering a skill changes color and dims others but nothing moves or fades', async ({ page }) => {
    await page.goto('/');
    await page.locator('.site-header nav a', { hasText: 'Skills' }).click();
    const rows = skillRows(page);
    const bar = rows.nth(0).locator('.bar').first();
    await rows.nth(0).hover();
    const magenta = await token(page, '--accent-magenta');
    await expect.poll(() => rows.nth(0).locator('.name').evaluate((el) => getComputedStyle(el).color)).toBe(magenta);
    await expect
      .poll(async () => Number(await rows.nth(1).locator('.bar').first().evaluate((el) => getComputedStyle(el).opacity)))
      .toBeCloseTo(0.35, 1);
    const { transform, duration } = await bar.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { transform: cs.transform, duration: cs.transitionDuration };
    });
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(transform);
    expect(duration).toBe('0s');
  });
});
