import { expect, test } from './fixtures';

test('local navigation highlights the current page in both color schemes', async ({ page }) => {
  await page.addInitScript(() => { localStorage.cookieTipv0Checked = 'true'; });
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    for (const suffix of ['category/press-release/', 'category/stories/', 'search/']) {
      const path = `/en/newsroom/${suffix}`;
      await page.goto(path);
      const mobile = await page.locator('#newsroom-menu-toggle').isVisible();
      if (mobile) await page.locator('#newsroom-menu-toggle').click();
      const nav = page.locator(mobile ? '#newsroom-extend-nav-menu' : '#newsroom-nav-menu');
      const current = nav.locator('[aria-current="page"]');
      await expect(current).toHaveCount(1);
      await expect(current).toHaveAttribute('href', path);
      await expect(current).toHaveCSS('font-weight', '500');
      const other = nav.getByRole('link', { name: 'RSS', exact: true });
      const inactive = await other.evaluate((element) => ({ color: getComputedStyle(element).color, weight: Number(getComputedStyle(element).fontWeight) }));
      expect(inactive.weight).toBeLessThan(500);
      await expect(current).not.toHaveCSS('color', inactive.color);
    }
  }
  await page.goto('/en/newsroom/');
  await expect(page.locator('#newsroom-header [aria-current]')).toHaveCount(0);
});
