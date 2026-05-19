import { expect, test } from '@playwright/test';

test('prefixed route should not auto redirect', async ({ page }) => {
  await page.goto('/zh-CN/aboutus/');
  await expect(page).toHaveURL(/\/zh-CN\/aboutus\/$/);
});

test('unprefixed route keeps path when english context', async ({ page }) => {
  await page.context().addCookies([
    {
      name: 'lang',
      value: 'en',
      domain: '127.0.0.1',
      path: '/',
    },
  ]);
  await page.goto('/aboutus/');
  await expect(page).toHaveURL(/\/aboutus\/$/);
});
