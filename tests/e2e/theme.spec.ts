import { expect, test } from '@playwright/test';

const html = 'html';
const toggle = '#theme-toggle';

const cssVar = (name: string) =>
  `getComputedStyle(document.documentElement).getPropertyValue('${name}').trim()`;

test.describe('with a light system theme', () => {
  test.use({ colorScheme: 'light' });

  test('toggle switches to dark and the choice survives a reload', async ({ page }) => {
    await page.goto('/');
    await page.click(toggle);
    await expect(page.locator(html)).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(page.locator(html)).toHaveAttribute('data-theme', 'dark');
  });

  test('a saved value that is not light or dark is ignored', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'blue'));
    await page.goto('/');
    // The visible toggle proves the theme scripts ran, so the missing attribute is a real result.
    await expect(page.locator(toggle)).toBeVisible();
    await expect(page.locator(html)).not.toHaveAttribute('data-theme');
  });

  test('blocked storage does not break the page or the toggle', async ({ page }) => {
    const errors: Error[] = [];
    page.on('pageerror', (error) => errors.push(error));
    await page.addInitScript(() => {
      const blocked = () => {
        throw new DOMException('Storage is disabled', 'SecurityError');
      };
      Storage.prototype.getItem = blocked;
      Storage.prototype.setItem = blocked;
    });

    await page.goto('/');
    await page.click(toggle);

    await expect(page.locator(html)).toHaveAttribute('data-theme', 'dark');
    expect(errors).toEqual([]);
  });
});

test.describe('with a dark system theme', () => {
  test.use({ colorScheme: 'dark' });

  test('follows the system setting when nothing is saved', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(html)).not.toHaveAttribute('data-theme');
    expect(await page.evaluate(cssVar('--bg'))).toBe('#0b0f24');
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the toggle is hidden', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(toggle)).toHaveCount(1);
    await expect(page.locator(toggle)).toBeHidden();
  });
});
