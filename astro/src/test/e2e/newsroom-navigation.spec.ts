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
