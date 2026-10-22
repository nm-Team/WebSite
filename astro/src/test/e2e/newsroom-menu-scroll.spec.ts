import { expect, test } from './fixtures';

test('the popup hides scrollbars during motion and scrolls when fully open', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'This test supplies a short mobile viewport');
  await page.setViewportSize({ width: 390, height: 240 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => { localStorage.cookieTipv0Checked = 'true'; });
  await page.goto('/en/newsroom/');
  const header = page.locator('#newsroom-header');
  const panel = page.locator('#newsroom-extended-menu');
  const toggle = page.locator('#newsroom-menu-toggle');
  await page.addStyleTag({ content: '#newsroom-header, #newsroom-extended-menu { transition-duration: 600ms; }' });

  await toggle.click();
  await expect.poll(() => header.evaluate((element) => element.getAnimations().some((animation) => animation.playState === 'running'))).toBe(true);
  await expect(panel).toHaveCSS('overflow-y', 'hidden');
  await expect(panel).toHaveCSS('overflow-y', 'auto');
  expect(await panel.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  await panel.hover();
  await page.mouse.wheel(0, 120);
  await expect.poll(() => panel.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

  await toggle.click();
  await expect(panel).toHaveCSS('overflow-y', 'hidden');
  await expect(panel).not.toBeVisible();

  const box = (await toggle.boundingBox())!;
  for (let i = 0; i < 3; i++) await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toHaveCSS('overflow-y', 'auto');
  await page.keyboard.press('Escape');
  await expect(panel).not.toBeVisible();
  await toggle.press('Enter');
  await expect(panel).toHaveCSS('overflow-y', 'auto');
  await page.keyboard.press('Escape');

  await toggle.click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(panel).toHaveCSS('overflow-y', 'auto');
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCSS('overflow-y', 'hidden');
});
