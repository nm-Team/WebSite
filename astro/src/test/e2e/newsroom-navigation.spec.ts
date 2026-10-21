import { expect, test } from '@playwright/test';

test('the global header scrolls away and local navigation stays at the top', async ({ page }) => {
  await page.goto('/en/newsroom/');
  const global = page.locator('#pageHeader');
  const local = page.locator('#newsroom-header');
  const globalBox = await global.boundingBox();
  const localBox = await local.boundingBox();
  expect(globalBox).not.toBeNull();
  expect(localBox).not.toBeNull();
  expect(Math.abs(localBox!.y - globalBox!.height)).toBeLessThan(1);
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect.poll(async () => (await local.boundingBox())!.y).toBe(0);
  expect((await global.boundingBox())!.y).toBeLessThan(-50);
  const duplicateIds = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
    return ids.filter((id, index) => ids.indexOf(id) !== index);
  });
  expect(duplicateIds).toEqual([]);
  await expect(page.locator('script[data-website-id]')).toHaveCount(1);
  await expect(page.locator('script[data-website-id]')).toHaveAttribute('data-website-id', '3f6853e3-82e8-4f73-977f-cf685c37e3c3');
});

test('mobile navigation keeps menus separate and restores focus and scrolling', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Both mobile menus are needed');
  await page.goto('/en/newsroom/');
  const local = page.locator('#newsroom-menu-toggle');
  const global = page.locator('#menu-toggle');
  await local.click();
  await expect(local).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await global.click();
  await expect(local).toHaveAttribute('aria-expanded', 'false');
  await expect(global).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(global).toHaveAttribute('aria-expanded', 'false');
  await expect(global).toBeFocused();
  await local.click();
  await page.keyboard.press('Escape');
  await expect(local).toHaveAttribute('aria-expanded', 'false');
  await expect(local).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await page.evaluate(() => window.scrollTo(0, 400));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(400);
});

test('local navigation fits narrow screens and respects light, dark and reduced-motion settings', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'This test supplies its own viewport matrix');
  test.setTimeout(60_000);
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    for (const width of [320, 390, 700, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/en/newsroom/', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme);
      const local = page.locator('#newsroom-header');
      expect((await local.boundingBox())!.height).toBe(width < 700 ? 48 : 52);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
      if (width < 700) {
        await page.locator('#newsroom-menu-toggle').click();
        await expect(page.locator('#newsroom-extended-menu')).toBeVisible();
        await expect(page.locator('#newsroom-main')).toHaveAttribute('inert', '');
        await expect(page.locator('#newsroom-menu-toggle .bar').first()).toHaveCSS('transition-duration', '0s');
      } else {
        await page.locator('[data-newsroom-search-toggle]').click();
        await expect(page.locator('#newsroom-query')).toBeFocused();
        await expect(page.locator('[data-newsroom-search-toggle]')).toHaveAttribute('aria-expanded', 'true');
      }
      await page.keyboard.press('Escape');
      await expect(page.locator('#newsroom-extended-menu')).not.toBeVisible();
      await expect(page.locator('#newsroom-main')).not.toHaveAttribute('inert');
    }
  }
});

test('local navigation contains no language switch and search uses the page language', async ({ page }) => {
  await page.goto('/zh-CN/newsroom/welcome-2021-08-09/');
  await expect(page.locator('#newsroom-header [hreflang]')).toHaveCount(0);
  const mobile = await page.locator('#newsroom-menu-toggle').isVisible();
  if (mobile) await page.locator('#newsroom-menu-toggle').click();
  else await page.locator('[data-newsroom-search-toggle]').click();
  await page.locator('#newsroom-query').fill('nmBot');
  await page.locator('#newsroom-query').press('Enter');
  await expect(page).toHaveURL(/\/zh-CN\/newsroom\/search\/\?q=nmBot$/);
  await expect(page.locator('#search-results a')).not.toHaveCount(0);
});
