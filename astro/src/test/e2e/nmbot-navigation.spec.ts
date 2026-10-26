import { expect, test } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { localStorage.cookieTipv0Checked = 'true'; });
});

test('shows both navigation levels above the hero and keeps product navigation at the sticky boundary', async ({ page }) => {
  await page.goto('/zh-CN/nmBot-Telegram/');
  const header = page.locator('#nmbot-header');
  const global = page.locator('#pageHeader');
  const boundary = (await global.boundingBox())!.height;
  const localBox = (await header.boundingBox())!;
  expect(localBox.y).toBeCloseTo(boundary, 0);
  expect((await page.getByTestId('nmbot-hero').boundingBox())!.y).toBeGreaterThanOrEqual(localBox.y + localBox.height);
  await expect(global.locator('.left')).toBeVisible();
  await expect(header).not.toHaveAttribute('data-stuck');
  await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

  await page.evaluate((top) => window.scrollTo(0, top), boundary - 1);
  await expect.poll(async () => (await header.boundingBox())!.y).toBe(1);
  await expect(header).not.toHaveAttribute('data-stuck');
  await page.evaluate((top) => window.scrollTo(0, top), boundary);
  await expect(header).toHaveAttribute('data-stuck');
  await expect(header).toHaveCSS('backdrop-filter', /blur\(22px\)/);
  for (const top of [600, 300]) {
    await page.evaluate((y) => window.scrollTo(0, y), top);
    await expect.poll(async () => (await header.boundingBox())!.y).toBe(0);
    expect((await global.boundingBox())!.y).toBeLessThan(-50);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).not.toHaveAttribute('data-stuck');
  await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  expect(await page.locator('[id]').evaluateAll((nodes) => {
    const ids = nodes.map((node) => node.id);
    return ids.filter((id, index) => ids.indexOf(id) !== index);
  })).toEqual([]);
});

test('keeps localized product actions and their existing destinations on every route', async ({ page }) => {
  const variants = [
    ['', 'en', 'nmBot Panel', 'Get Started'],
    ['en/', 'en', 'nmBot Panel', 'Get Started'],
    ['zh-CN/', 'zh-CN', 'nmBot 面板', '开始使用'],
    ['zh-HK/', 'zh-HK', 'nmBot 面板', '開始使用'],
    ['ja-JP/', 'ja-JP', 'nmBot Panel', 'Get Started'],
    ['zh-x-mars/', 'zh-x-mars', 'nmBot 媔闆', '開始使鼡'],
  ];
  for (const [prefix, locale, panelLabel, startLabel] of variants) {
    await page.goto(`/${prefix}nmBot-Telegram/`);
    await expect(page.locator('#nmbot-header .site-name-text')).toHaveAttribute('href', `/${locale}/nmBot-Telegram/`);
    const mobile = await page.locator('#nmbot-menu-toggle').isVisible();
    if (mobile) await page.locator('#nmbot-menu-toggle').click();
    const nav = page.locator(mobile ? '#nmbot-extend-nav-menu' : '#nmbot-nav-menu');
    for (const [label, href] of [[panelLabel, 'https://nmbot.nmnm.fun?ref=nmBotHeader'], [startLabel, 'https://t.me/nmnmfunbot']]) {
      const link = nav.getByRole('link', { name: label, exact: true });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', href);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  }
});

test('mobile menus restore focus, scrolling and content access when dismissed or resized', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.use.isMobile, 'This flow requires both mobile menus.');
  await page.goto('/zh-CN/nmBot-Telegram/');
  const local = page.locator('#nmbot-menu-toggle');
  const global = page.locator('#menu-toggle');
  const panel = page.locator('#nmbot-extended-menu');
  await local.press('Enter');
  await expect(local).toHaveAttribute('aria-expanded', 'true');
  await expect(panel.getByRole('link').first()).toBeFocused();
  await expect(page.locator('#main-content')).toHaveAttribute('inert');
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await panel.getByRole('link').last().focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#nmbot-header .site-name-text')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(panel.getByRole('link').last()).toBeFocused();

  await global.press('Enter');
  await expect(local).toHaveAttribute('aria-expanded', 'false');
  await expect(global).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(global).toBeFocused();
  await expect(page.locator('[data-secondary-navigation-content]')).not.toHaveAttribute('inert');
  await local.press('Enter');
  await page.keyboard.press('Escape');
  await expect(local).toBeFocused();
  await expect(panel).not.toBeVisible();

  await local.click();
  await page.locator('.secondary-navigation-backdrop').click({ position: { x: 10, y: 400 } });
  await expect(local).toHaveAttribute('aria-expanded', 'false');
  await local.click();
  await page.setViewportSize({ width: 800, height: 700 });
  await expect(panel).not.toBeVisible();
  await expect(page.locator('#main-content')).not.toHaveAttribute('inert');
  await expect(page.locator('#fcont')).not.toHaveAttribute('inert');
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await expect(page.locator('#nmbot-nav-menu').getByRole('link', { name: '开始使用' })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 400));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(400);
});

test('navigation stays readable on narrow and short viewports with reduced motion', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'This test supplies its own viewport matrix.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const viewports = [320, 390, 699, 700, 768, 901, 1440, 1920].map((width) => ({ width, height: 900 }));
  viewports.push(...[178, 315, 800].map((height) => ({ width: 798, height })));
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/en/nmBot-Telegram/');
    await page.evaluate(() => window.scrollTo(0, 300));
    const header = page.locator('#nmbot-header');
    await expect(header).toHaveAttribute('data-stuck');
    await expect(header.locator('.site-name-text')).toHaveCSS('font-size', '21px');
    expect((await header.boundingBox())!.height).toBe(viewport.width < 700 ? 48 : 52);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    if (viewport.width < 700) {
      await page.locator('#nmbot-menu-toggle').click();
      await expect(page.locator('#nmbot-extended-menu')).toBeVisible();
      await expect(page.locator('#nmbot-menu-toggle .bar').first()).toHaveCSS('transition-duration', '0s');
    } else {
      await expect(page.locator('#nmbot-nav-menu .secondary-navigation-action')).toHaveCSS('font-size', '14px');
    }
    const bounds = (await header.boundingBox())!;
    const visibleLinks = await header.locator('a').evaluateAll((links) => links.filter((link) => link.checkVisibility()).map((link) => {
      const box = link.getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
    }));
    for (const link of visibleLinks) {
      expect(link.left).toBeGreaterThanOrEqual(bounds.x);
      expect(link.right).toBeLessThanOrEqual(bounds.x + bounds.width);
      expect(link.top).toBeGreaterThanOrEqual(bounds.y);
      expect(link.bottom).toBeLessThanOrEqual(bounds.y + bounds.height);
    }
  }
});

test('product navigation follows the existing light and dark section themes', async ({ page }) => {
  await page.goto('/en/nmBot-Telegram/');
  const name = page.locator('#nmbot-header .site-name-text');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(name).toHaveCSS('color', 'rgb(245, 243, 237)');
  await page.locator('#intelligenceContainer').evaluate((element) => window.scrollTo(0, window.scrollY + element.getBoundingClientRect().top + 10));
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'default');
  await expect(name).toHaveCSS('color', 'rgb(23, 21, 15)');
  await expect(page.locator('#nmbot-header')).toHaveAttribute('data-stuck');
  await page.evaluate(() => window.scrollTo(0, 300));
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(name).toHaveCSS('color', 'rgb(245, 243, 237)');
});
