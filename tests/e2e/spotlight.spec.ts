import { expect, test, type Page } from '@playwright/test';

const active = (page: Page) => page.locator('.spotlight .slide:not([hidden])');
const label = async (page: Page) => active(page).getAttribute('aria-label');

// Fake timers, then bring the spotlight on screen. The probe's first callback lands in the same
// rendering step as the component's observer, so by the time it resolves the spotlight knows it is on screen.
async function openInView(page: Page) {
  await page.clock.install();
  await page.goto('/');
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
  await expect(page.locator('#projects article')).toHaveCount(7);
});

test('it advances after 7 seconds', async ({ page }) => {
  await openInView(page);
  await page.mouse.move(0, 0);
  await page.clock.runFor(7000);
  expect(await label(page)).toBe('2 of 6');
  await expect(page.locator('.spotlight .slides')).toHaveAttribute('aria-live', 'off');
});

test('it holds while hovered and resumes after', async ({ page }) => {
  await openInView(page);
  await page.locator('.spotlight').hover();
  await page.clock.runFor(15000);
  expect(await label(page)).toBe('1 of 6');
  await page.mouse.move(0, 0);
  await page.clock.runFor(7000);
  expect(await label(page)).toBe('2 of 6');
});

test('it holds while focus is inside and resumes after focus leaves', async ({ page }) => {
  await openInView(page);
  await page.mouse.move(0, 0);
  await page.locator('.spotlight .rotation').focus();
  await page.clock.runFor(15000);
  expect(await label(page)).toBe('1 of 6');
  await page.locator('.site-header a').first().focus();
  await page.clock.runFor(7000);
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
  await page.clock.runFor(7000);
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
    expect(await height()).toBe(first);
  }
});

test('the controls sit centered below the slides', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const slides = (await page.locator('.spotlight .slides').boundingBox())!;
  const controls = (await page.locator('.spotlight .controls').boundingBox())!;
  const buttons = page.locator('.spotlight .controls button');
  const first = (await buttons.first().boundingBox())!;
  const last = (await buttons.last().boundingBox())!;
  expect(controls.y).toBeGreaterThanOrEqual(slides.y + slides.height);
  const rowCenter = (first.x + last.x + last.width) / 2;
  expect(Math.abs(rowCenter - (slides.x + slides.width / 2))).toBeLessThanOrEqual(1);
});

test('the rotation button shows one icon and no text', async ({ page }) => {
  await page.goto('/');
  const rotation = page.locator('.spotlight .rotation');
  await expect(rotation.locator('svg:visible')).toHaveCount(1);
  expect((await rotation.innerText()).trim()).toBe('');
  await rotation.click();
  await expect(rotation).toHaveAccessibleName('Play');
  await expect(rotation.locator('svg:visible')).toHaveCount(1);
});

test('the control buttons have no background and turn magenta on hover', async ({ page }) => {
  await page.goto('/');
  for (const name of ['rotation', 'prev', 'next']) {
    const button = page.locator(`.spotlight .${name}`);
    expect(await button.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
    await button.hover();
    const [color, magenta] = await button.evaluate((el) => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--accent-magenta)';
      el.append(probe);
      const result = [getComputedStyle(el).color, getComputedStyle(probe).color];
      probe.remove();
      return result;
    });
    expect(color).toBe(magenta);
  }
});

test('the pips sit 24px apart and every control is 44px tall', async ({ page }) => {
  await page.goto('/');
  const dots = page.locator('.spotlight .dot');
  const a = (await dots.nth(0).boundingBox())!;
  const b = (await dots.nth(1).boundingBox())!;
  expect(b.x - a.x).toBe(24);
  for (const box of await page.locator('.spotlight .controls button').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height))) {
    expect(box).toBeGreaterThanOrEqual(44);
  }
});

test('the controls fit on one row at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
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
  // At 1280x800 the spotlight starts below the fold.
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.clock.install();
  await page.goto('/');
  await expect(page.locator('.spotlight')).not.toBeInViewport();
  await page.mouse.move(0, 0);
  await page.clock.runFor(21000);
  expect(await label(page)).toBe('1 of 6');
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
