import { expect, test, type Page } from '@playwright/test';

const active = (page: Page) => page.locator('.spotlight .slide:not([hidden])');
const label = async (page: Page) => active(page).getAttribute('aria-label');

// Fake timers, then bring the spotlight on screen.
async function openInView(page: Page) {
  await page.clock.install();
  await page.goto('/');
  await scrollIntoView(page);
}

// The probe's first callback lands in the same rendering step as the component's observer,
// so by the time it resolves the spotlight knows it is on screen.
async function scrollIntoView(page: Page) {
  await page.locator('.spotlight').scrollIntoViewIfNeeded();
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        new IntersectionObserver((_, observer) => {
          observer.disconnect();
          resolve();
        }).observe(document.querySelector('.spotlight')!);
      }),
  );
}

test('it shows one slide per released game, first one first', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.spotlight .slide')).toHaveCount(6);
  expect(await label(page)).toBe('1 of 6');
  await expect(page.locator('#games article')).toHaveCount(7);
});

test('it advances after 5 seconds', async ({ page }) => {
  await openInView(page);
  await page.mouse.move(0, 0);
  await page.clock.runFor(5000);
  expect(await label(page)).toBe('2 of 6');
  await expect(page.locator('.spotlight .slides')).toHaveAttribute('aria-live', 'off');
});

test('it holds while hovered and resumes after', async ({ page }) => {
  await openInView(page);
  await page.locator('.spotlight').hover();
  await page.clock.runFor(15000);
  expect(await label(page)).toBe('1 of 6');
  await page.mouse.move(0, 0);
  await page.clock.runFor(5000);
  expect(await label(page)).toBe('2 of 6');
});

test('it holds while focus is inside and resumes after focus leaves', async ({ page }) => {
  await openInView(page);
  await page.mouse.move(0, 0);
  await page.locator('.spotlight .rotation').focus();
  await page.clock.runFor(15000);
  expect(await label(page)).toBe('1 of 6');
  await page.locator('.site-header a').first().focus();
  await page.clock.runFor(5000);
  expect(await label(page)).toBe('2 of 6');
});

test('the pause button stops it and says Play', async ({ page }) => {
  await openInView(page);
  await page.mouse.move(0, 0);
  await page.locator('.spotlight .rotation').click();
  await page.mouse.move(0, 0);
  await expect(page.locator('.spotlight .rotation')).toHaveAccessibleName('Play');
  await expect(page.locator('.spotlight .slides')).toHaveAttribute('aria-live', 'polite');
  await page.clock.runFor(21000);
  expect(await label(page)).toBe('1 of 6');
});

test('using next or a dot changes the slide and stops auto-advance for good', async ({ page }) => {
  await openInView(page);
  await page.locator('.spotlight .next').click();
  expect(await label(page)).toBe('2 of 6');
  await page.locator('.spotlight .dot').nth(4).click();
  expect(await label(page)).toBe('5 of 6');
  await expect(page.locator('.spotlight .dot').nth(4)).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('.spotlight .rotation')).toHaveAccessibleName('Play');
  await expect(page.locator('.spotlight .slides')).toHaveAttribute('aria-live', 'polite');
  await page.mouse.move(0, 0);
  await page.clock.runFor(21000);
  expect(await label(page)).toBe('5 of 6');
});

test('pressing Play after stepping resumes auto-advance', async ({ page }) => {
  await openInView(page);
  await page.locator('.spotlight .next').click();
  await page.locator('.spotlight .rotation').click();
  await expect(page.locator('.spotlight .rotation')).toHaveAccessibleName('Pause');
  await page.mouse.move(0, 0);
  await page.locator('.site-header a').first().focus();
  await page.clock.runFor(5000);
  expect(await label(page)).toBe('3 of 6');
});

test('pressing Play resumes even while the pointer and focus stay on the button', async ({ page }) => {
  await openInView(page);
  await page.locator('.spotlight .next').click();
  await page.locator('.spotlight .rotation').click();
  await page.clock.runFor(5000);
  expect(await label(page)).toBe('3 of 6');
});

test('the spotlight keeps one height across every slide', async ({ page }) => {
  // Phone width stacks the text under the image, so summary length would show in the height.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const height = async () => (await page.locator('.spotlight').boundingBox())!.height;
  const first = await height();
  for (let i = 2; i <= 6; i++) {
    await page.locator('.spotlight .next').click();
    expect(await label(page)).toBe(`${i} of 6`);
    expect(await height()).toBeCloseTo(first, 1);
  }
});

test('every control is at least 44px tall', async ({ page }) => {
  await page.goto('/');
  for (const box of await page.locator('.spotlight .controls button').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height))) {
    expect(box).toBeGreaterThanOrEqual(44);
  }
});

// At 320px the row exactly fills the space inside the gutters, so any added control or gap would wrap it.
test('the controls fit on one row at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/');
  const tops = await page.locator('.spotlight .controls button').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
  expect(new Set(tops).size).toBe(1);
});

test('previous wraps from the first slide to the last', async ({ page }) => {
  await page.goto('/');
  await page.locator('.spotlight .prev').click();
  expect(await label(page)).toBe('6 of 6');
});

test('it does not advance while scrolled off screen', async ({ page }) => {
  // At 1280x800 only the top edge of the spotlight shows at first, under the half it needs to count as on screen.
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.clock.install();
  await page.goto('/');
  await expect(page.locator('.spotlight')).not.toBeInViewport({ ratio: 0.5 });
  await page.mouse.move(0, 0);
  await page.clock.runFor(21000);
  expect(await label(page)).toBe('1 of 6');
});

test('scrolling back to it gives the current slide its full 5 seconds', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.clock.install();
  await page.goto('/');
  await page.mouse.move(0, 0);
  await page.clock.runFor(3000);
  await scrollIntoView(page);
  await page.clock.runFor(2500);
  expect(await label(page)).toBe('1 of 6');
  await page.clock.runFor(2500);
  expect(await label(page)).toBe('2 of 6');
});

// Playwright can't hide a real tab, so this stands in for one: the state the page reads, and the event it hears.
const setTabVisible = (page: Page, visible: boolean) =>
  page.evaluate((v) => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (v ? 'visible' : 'hidden') });
    document.dispatchEvent(new Event('visibilitychange'));
  }, visible);

test('coming back to the tab gives the current slide its full 5 seconds', async ({ page }) => {
  await openInView(page);
  await page.mouse.move(0, 0);
  await page.clock.runFor(3000);
  await setTabVisible(page, false);
  await page.clock.runFor(10000);
  expect(await label(page)).toBe('1 of 6');
  await setTabVisible(page, true);
  await page.clock.runFor(2500);
  expect(await label(page)).toBe('1 of 6');
  await page.clock.runFor(2500);
  expect(await label(page)).toBe('2 of 6');
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('it never auto-advances, steps by hand, and switches instantly', async ({ page }) => {
    await openInView(page);
    await page.mouse.move(0, 0);
    await page.clock.runFor(21000);
    expect(await label(page)).toBe('1 of 6');
    await expect(page.locator('.spotlight .rotation')).toHaveAccessibleName('Play');
    await page.locator('.spotlight .next').click();
    expect(await label(page)).toBe('2 of 6');
    const duration = await active(page).evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(duration).toBe('0s');
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the first slide shows and the controls stay hidden', async ({ page }) => {
    await page.goto('/');
    expect(await label(page)).toBe('1 of 6');
    await expect(page.locator('.spotlight .controls')).toBeHidden();
  });
});
