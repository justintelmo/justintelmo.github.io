import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  test(`axe finds no WCAG A/AA violations in ${theme} mode`, async ({ page }) => {
    await page.goto('/');
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}
