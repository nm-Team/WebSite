import type { Page } from '@playwright/test';

import { scene } from '../../lib/lemon-line/scene';
import { expect, test } from './fixtures';

test.use({ reducedMotion: 'no-preference' });
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cookieTipv0Checked', 'true'));
});

async function openLine(page: Page) {
  await page.goto('/zh-CN/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  const line = page.getByTestId('lemon-line');
  await line.scrollIntoViewIfNeeded();
  return line;
}

async function expectMachineOpaque(page: Page): Promise<void> {
  expect(await page.getByTestId('lemon-line').locator('canvas').evaluate((canvas: HTMLCanvasElement, machine) => {
    const scale = canvas.width / 1296;
    const pixels = canvas.getContext('2d')!.getImageData((machine.x + 15) * scale, (machine.y + 15) * scale,
      (machine.width - 30) * scale, (machine.height - 30) * scale).data;
    let yellow = 0;
    for (let i = 0; i < pixels.length; i += 4) if (pixels[i] > 170 && pixels[i + 1] > 140 && pixels[i + 2] < 130) yellow++;
    return yellow;
  }, scene.machine)).toBe(0);
}

async function expectConveyorOpaque(page: Page): Promise<void> {
  expect(await page.getByTestId('lemon-line').locator('canvas').evaluate((canvas: HTMLCanvasElement, geometry) => {
    const scale = canvas.width / geometry.width;
    const pixels = canvas.getContext('2d')!.getImageData((geometry.flatStart + 10) * scale,
      (geometry.beltTop + 4) * scale, (geometry.flatEnd - geometry.flatStart - 20) * scale,
      (geometry.beltRadius * 2 - 8) * scale).data;
    let yellow = 0;
    for (let i = 0; i < pixels.length; i += 4) if (pixels[i] > 170 && pixels[i + 1] > 140 && pixels[i + 2] < 130) yellow++;
    return yellow;
  }, scene)).toBe(0);
}

test('keeps the original geometry at every viewport and when canvas takes over', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Measure the four reference widths once.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const line = await openLine(page);
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    // Let the existing carousels respond to the viewport resize first.
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    const before = await line.boundingBox();
    expect(before).not.toBeNull();
    expect(before!.width).toBeCloseTo(Math.min(width * 0.8, 900), 1);
    expect(before!.height).toBeCloseTo(before!.width * 393 / 1296, 1);
    expect(before!.x).toBeCloseTo((width - before!.width) / 2, 1);
    expect(await line.evaluate(el => getComputedStyle(el).marginTop)).toBe('24px');
    const reference = await line.evaluate(el => {
      const originalTop = el.getBoundingClientRect().top + scrollY;
      const image = document.createElement('img');
      image.className = 'lemonLine';
      image.width = 1296;
      image.height = 393;
      el.replaceWith(image);
      const bounds = image.getBoundingClientRect();
      const result = { originalTop, top: bounds.top + scrollY, width: bounds.width, height: bounds.height };
      image.replaceWith(el);
      return result;
    });
    expect(reference.originalTop).toBe(reference.top);
    expect(before!.width).toBe(reference.width);
    expect(before!.height).toBe(reference.height);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await line.scrollIntoViewIfNeeded();
    await expect(line).toHaveAttribute('data-ready', 'true');
    const after = await line.boundingBox();
    expect(after!.width).toBe(before!.width);
    expect(after!.height).toBe(before!.height);
    expect(await line.evaluate(el => el.getBoundingClientRect().top + scrollY)).toBe(reference.originalTop);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(line).toHaveAttribute('data-state', 'static');
    await expect(line.locator('canvas')).toBeVisible();
    await expect(line.locator('.lemon-line__fallback')).toBeHidden();
  }
});

test('collects partial baskets without stopping production', async ({ page }) => {
  await page.clock.install();
  const line = await openLine(page);
  await expect(line).toHaveAttribute('data-ready', 'true');
  await expect(line).toHaveAttribute('data-collected', '1');
  const fruit = line.locator('[data-lemon]:not([hidden])').first();
  const before = await fruit.boundingBox();
  await line.locator('[data-basket]').click();
  await page.clock.runFor(500);
  await expect(line).toHaveAttribute('data-collected', '0');
  await expect(line).toHaveAttribute('data-state', 'running');
  await expect(line).toHaveAttribute('data-collections', '1');
  expect((await fruit.boundingBox())!.x).toBeGreaterThan(before!.x);
  const machine = line.locator('[data-machine]');
  expect(await machine.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
});

test('automatically collects a naturally formed full basket', async ({ page }) => {
  await page.clock.install();
  const line = await openLine(page);
  await expect(line).toHaveAttribute('data-ready', 'true');
  for (let elapsed = 0; elapsed < 20_000 && Number(await line.getAttribute('data-collections')) === 0; elapsed += 1000) {
    await page.clock.runFor(1000);
  }
  expect(Number(await line.getAttribute('data-collections'))).toBeGreaterThanOrEqual(1);
});

test('ignores machine clicks', async ({ page }) => {
  await page.clock.install();
  const line = await openLine(page);
  await expect(line).toHaveAttribute('data-ready', 'true');
  const machine = line.locator('[data-machine]');
  await expect(machine).toHaveAttribute('aria-hidden', 'true');
  expect(await machine.getAttribute('aria-pressed')).toBeNull();
  const box = (await machine.boundingBox())!;
  const frame = await line.locator('canvas').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.clock.runFor(500);
  await expect(line).toHaveAttribute('data-state', 'running');
  expect(await line.locator('canvas').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())).not.toBe(frame);
});

test('supports keyboard selection, movement and release in place', async ({ page }) => {
  await page.clock.install();
  const line = await openLine(page);
  await expect(line).toHaveAttribute('data-ready', 'true');
  const lemon = line.locator('[data-lemon]:not([hidden])').first();
  const id = await lemon.getAttribute('data-lemon');
  await lemon.press('Enter');
  await expect(lemon).toHaveAttribute('aria-pressed', 'true');
  const before = await lemon.boundingBox();
  await lemon.press('ArrowUp');
  await lemon.press('ArrowRight');
  await page.clock.runFor(50);
  expect((await lemon.boundingBox())!.x).toBeGreaterThan(before!.x);
  await lemon.press('Enter');
  await page.clock.runFor(32);
  await expect(lemon).toHaveAttribute('aria-pressed', 'false');
  await expect(line.locator(`[data-lemon="${id}"]`)).toHaveAttribute('data-stamped', 'false');
  await lemon.press('Space');
  await expect(lemon).toHaveAttribute('aria-pressed', 'true');
  await lemon.press('Space');
  await page.clock.runFor(32);
  await expect(lemon).toHaveAttribute('aria-pressed', 'false');
});

test('clicks and taps never select fruit for a second-click destination', async ({ page }, info) => {
  await page.clock.install();
  const line = await openLine(page);
  await expect(line).toHaveAttribute('data-ready', 'true');
  const candidate = line.locator('[data-lemon]:not([hidden])').nth(2);
  const id = await candidate.getAttribute('data-lemon');
  const lemon = line.locator(`[data-lemon="${id}"]`);
  const bounds = (await line.boundingBox())!;
  const touch = Boolean(info.project.use.hasTouch);
  for (const destination of ['empty', 'machine', 'basket']) {
    const before = (await lemon.boundingBox())!;
    // Hit the moving fruit directly without waiting for its bounds to settle.
    const fruitX = before.x + before.width / 2;
    const fruitY = before.y + before.height / 2;
    if (touch) await page.touchscreen.tap(fruitX, fruitY);
    else await page.mouse.click(fruitX, fruitY);
    await page.clock.runFor(32);
    await expect(line.locator('[data-lemon][aria-pressed="true"]')).toHaveCount(0);
    const target = destination === 'empty' ? null : (await line.locator(`[data-${destination}]`).boundingBox())!;
    const x = target ? target.x + target.width / 2 : bounds.x + bounds.width * 0.9;
    const y = target ? target.y + target.height / 2 : bounds.y + bounds.height * 0.1;
    if (touch) await page.touchscreen.tap(x, y);
    else await page.mouse.click(x, y);
    await page.clock.runFor(100);
    await expect(line.locator('[data-lemon][aria-pressed="true"]')).toHaveCount(0);
    expect(Math.abs((await lemon.boundingBox())!.x - before.x)).toBeLessThan(bounds.width * 0.2);
  }
});

test('drags and releases a lemon without leaving it selected', async ({ page }) => {
  const line = await openLine(page);
  await expect(line).toHaveAttribute('data-ready', 'true');
  const lemon = line.locator('[data-lemon]:not([hidden])').first();
  const box = (await lemon.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2 - 30, { steps: 8 });
  await expect(line.locator('[data-lemon][aria-pressed="true"]')).toHaveCount(1);
  expect(await line.locator('[data-lemon][aria-pressed="true"]').evaluate(el => getComputedStyle(el).outlineStyle)).toBe('none');
  await page.mouse.up();
  await expect(line.locator('[data-lemon][aria-pressed="true"]')).toHaveCount(0);
});

test('occludes a held lemon behind the laser and keeps the pointer captured until it reappears', async ({ page }) => {
  await page.clock.install();
  const line = await openLine(page);
  await expect(line).toHaveAttribute('data-ready', 'true');
  const lemon = line.locator('[data-lemon]:not([hidden])').first();
  const id = await lemon.getAttribute('data-lemon');
  const held = line.locator(`[data-lemon="${id}"]`);
  const bounds = (await line.boundingBox())!;
  const box = (await lemon.boundingBox())!;
  const scale = bounds.width / scene.width;
  const x = box.x + box.width / 2;
  await page.mouse.move(x, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(x, bounds.y, { steps: 8 });
  await page.mouse.move(bounds.x + (scene.machine.x + scene.machine.width / 2) * scale, bounds.y, { steps: 8 });
  await page.mouse.move(bounds.x + (scene.machine.x + scene.machine.width / 2) * scale, bounds.y + 120 * scale, { steps: 8 });
  await page.clock.runFor(32);
  await expect(held).toHaveAttribute('aria-pressed', 'true');
  await expect(held).toBeHidden();
  await expect(held).toHaveAttribute('data-stamped', 'true');
  await expectMachineOpaque(page);
  await page.mouse.move(bounds.x + (scene.machine.x + scene.machine.width / 2) * scale, bounds.y, { steps: 8 });
  await page.mouse.move(x, bounds.y, { steps: 8 });
  await page.clock.runFor(32);
  await expect(held).toBeVisible();
  await expect(held).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.up();
  await page.clock.runFor(32);
  await expect(held).toHaveAttribute('aria-pressed', 'false');
});

test('suspends offscreen and resumes automatically on return', async ({ page }) => {
  await page.clock.install();
  const line = await openLine(page);
  await expect(line).toHaveAttribute('data-ready', 'true');
  await page.evaluate(() => scrollTo(0, 0));
  await page.clock.runFor(100);
  const frame = await line.locator('canvas').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  await page.clock.runFor(5_000);
  expect(await line.locator('canvas').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())).toBe(frame);
  await line.scrollIntoViewIfNeeded();
  await expect(line).toHaveAttribute('data-state', 'running');
  // IntersectionObserver is delivered by the browser, outside the mocked
  // animation clock. Give it a rendering turn before checking resumed frames.
  await expect.poll(async () => {
    await page.clock.runFor(100);
    return line.locator('canvas').evaluate((canvas: HTMLCanvasElement, previous) => canvas.toDataURL() === previous, frame);
  }).toBe(false);
});

test('handles pointer cancellation and persisted page lifecycle events', async ({ page }) => {
  await page.clock.install();
  const line = await openLine(page);
  await expect(line).toHaveAttribute('data-ready', 'true');
  const lemon = line.locator('[data-lemon]:not([hidden])').first();
  const box = (await lemon.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.clock.runFor(50);
  await expect(line.locator('[data-lemon][aria-pressed="true"]')).toHaveCount(1);
  await line.dispatchEvent('pointercancel', { pointerId: 1 });
  // The synthetic cancel does not reset Playwright's real mouse state.
  // Release outside the artwork so it cannot synthesize a new selection click.
  await page.mouse.move(5, 5);
  await page.mouse.up();
  await page.clock.runFor(50);
  await expect(line.locator('[data-lemon][aria-pressed="true"]')).toHaveCount(0);
  const count = await line.locator('[data-lemon]').count();
  await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
  });
  await page.clock.runFor(500);
  await expect(line).toHaveAttribute('data-state', 'running');
  await expect(line.locator('[data-lemon]')).toHaveCount(count);
});

test('restores home scroll position on reload and back navigation without duplicate controls', async ({ page }) => {
  const line = await openLine(page);
  await expect(line).toHaveAttribute('data-ready', 'true');
  const saved = await page.evaluate(() => scrollY);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(saved, 0);
  await expect(line).toHaveAttribute('data-ready', 'true');
  await expect(line.locator('[data-machine]')).toHaveCount(1);
  await page.goto('/zh-CN/aboutus/', { waitUntil: 'domcontentloaded' });
  await page.goBack({ waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(saved, 0);
  await expect(line).toHaveAttribute('data-ready', 'true');
  await expect(line.locator('canvas')).toHaveCount(1);
  await expect(line.locator('[data-machine]')).toHaveCount(1);
});

test('releases a held lemon on window blur and viewport rotation', async ({ page }) => {
  await page.clock.install();
  const line = await openLine(page);
  await expect(line).toHaveAttribute('data-ready', 'true');
  for (const interrupt of ['blur', 'resize']) {
    const box = (await line.locator('[data-lemon]:not([hidden])').first().boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.clock.runFor(50);
    await expect(line.locator('[data-lemon][aria-pressed="true"]')).toHaveCount(1);
    if (interrupt === 'blur') await page.evaluate(() => dispatchEvent(new Event('blur')));
    else await page.setViewportSize({ width: 500, height: 850 });
    await page.clock.runFor(100);
    await expect(line.locator('[data-lemon][aria-pressed="true"]')).toHaveCount(0);
    await page.mouse.move(5, 5);
    await page.mouse.up();
  }
});

test('keeps touch dragging local to lemons and lets empty artwork scroll', async ({ page, context }, info) => {
  test.skip(info.project.name !== 'mobile', 'Exercise native Chromium touch input once.');
  const line = await openLine(page);
  await expect(line).toHaveAttribute('data-ready', 'true');
  const session = await context.newCDPSession(page);
  const box = (await line.locator('[data-lemon]:not([hidden])').first().boundingBox())!;
  const scroll = await page.evaluate(() => scrollY);
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + 35, y: y - 30 }] });
  await expect(line.locator('[aria-pressed="true"][data-lemon]')).toHaveCount(1);
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  expect(await page.evaluate(() => scrollY)).toBe(scroll);
  const bounds = (await line.boundingBox())!;
  const empty = { x: bounds.x + bounds.width * 0.05, y: bounds.y + 8 };
  expect(await page.evaluate(point => getComputedStyle(document.elementFromPoint(point.x, point.y)!).touchAction, empty)).toBe('auto');
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [empty] });
  for (const distance of [20, 45, 70]) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: empty.x, y: empty.y - distance }] });
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(scroll);
  await session.detach();
});

test('restarts safely when motion preferences change during image decoding', async ({ page }) => {
  let finishImage!: () => void;
  const pendingImage = new Promise<void>(resolve => { finishImage = resolve; });
  await page.route('**/lemon-line/lemon.svg', async route => {
    await pendingImage;
    await route.continue();
  });
  const requested = page.waitForRequest('**/lemon-line/lemon.svg');
  const line = await openLine(page);
  await requested;
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  finishImage();
  await expect(line).toHaveAttribute('data-ready', 'true');
  expect(await line.locator('[data-lemon]').count()).toBeLessThanOrEqual(18);
  await expect(line.locator('[data-machine]')).toHaveCount(1);
});

test('keeps artwork hidden during loading and reveals the canvas without a fallback flash', async ({ page }) => {
  let finishImage!: () => void;
  const pending = new Promise<void>(resolve => { finishImage = resolve; });
  await page.route('**/lemon-line/lemon.svg', async route => { await pending; await route.continue(); });
  const requested = page.waitForRequest('**/lemon-line/lemon.svg');
  const line = await openLine(page);
  await requested;
  await expect(line.locator('.lemon-line__fallback')).toBeHidden();
  await expect(line.locator('canvas')).toBeHidden();
  expect((await line.boundingBox())!.height).toBeGreaterThan(50);
  finishImage();
  await expect(line).toHaveAttribute('data-ready', 'true');
  await expect(line.locator('canvas')).toBeVisible();
  await expect(line.locator('.lemon-line__fallback')).toBeHidden();
});

test('starts with dense, correctly marked fruit behind both equipment housings', async ({ page }) => {
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const line = await openLine(page);
  await expect(line).toHaveAttribute('data-ready', 'true');
  await expect(line.locator('[data-lemon]')).toHaveCount(12);
  const outgoing = await line.evaluate(el => {
    const machine = el.querySelector('[data-machine]')!.getBoundingClientRect();
    const basket = el.querySelector('[data-basket]')!.getBoundingClientRect();
    return [...el.querySelectorAll<HTMLButtonElement>('[data-lemon]')].filter(button => {
      const box = button.getBoundingClientRect();
      const center = box.x + box.width / 2;
      return !button.hidden && center > machine.right && center < basket.left;
    }).map(button => button.dataset.stamped);
  });
  expect(outgoing).toEqual(['true', 'true']);
  await expectMachineOpaque(page);
  await expectConveyorOpaque(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(line).toHaveAttribute('data-motion', 'animated');
  for (let frame = 0; frame < 8; frame++) {
    await page.clock.runFor(16);
    await expectMachineOpaque(page);
    await expectConveyorOpaque(page);
  }
});

test('renders a still canvas for reduced motion without displaying the failure image', async ({ page }) => {
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const line = await openLine(page);
  await expect(line).toHaveAttribute('data-state', 'static');
  await expect(line.locator('canvas')).toBeVisible();
  await expect(line.locator('.lemon-line__fallback')).toBeHidden();
  await expect(line.locator('[data-machine]')).toBeHidden();
  const first = await line.locator('canvas').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  await page.clock.runFor(5_000);
  expect(await line.locator('canvas').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())).toBe(first);
});

for (const failure of ['unsupported', 'asset', 'contextlost'] as const) {
  test(`retains the static artwork when ${failure}`, async ({ page }) => {
    if (failure === 'unsupported') await page.addInitScript(() => {
      Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', { value: () => null });
    });
    if (failure === 'asset') await page.route('**/lemon-line/lemon.svg', route => route.abort());
    const line = await openLine(page);
    if (failure === 'contextlost') {
      await expect(line).toHaveAttribute('data-ready', 'true');
      await line.locator('canvas').dispatchEvent('contextlost');
    }
    await expect(line).toHaveAttribute('data-fallback', 'true');
    await expect(line.locator('.lemon-line__fallback')).toBeVisible();
    await expect.poll(() => line.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await expect(line.locator('canvas')).toBeHidden();
    await expect(line.locator('[data-machine]')).toBeHidden();
  });
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('renders the original artwork with the same reserved aspect ratio', async ({ page }) => {
    await page.goto('/zh-CN/', { waitUntil: 'load' });
    const line = page.getByTestId('lemon-line');
    await expect(line.locator('.lemon-line__noscript')).toBeVisible();
    await expect(line.locator('canvas')).toBeHidden();
    const box = (await line.boundingBox())!;
    expect(box.height).toBeCloseTo(box.width * 393 / 1296, 1);
  });
});
