import { expect, test } from '@playwright/test';

const phaseTwoRoutes = [
  '/aboutus/',
  '/cookies/',
  '/business-cooperation/',
  '/legal/privacy-policy/',
  '/legal/network-service-protocol/',
];

const phaseTwoJumpRoutes = [
  '/support/',
  '/status/',
];

for (const route of phaseTwoRoutes) {
  test(`unprefixed ${route} keeps English content without JavaScript`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(route);
    await expect(page.locator('body')).toContainText(/nmTeam|Cookies|Business|Privacy|Service|Support|Status/);
    await expect(page).toHaveURL(new RegExp(`${route.replace(/\//g, '\\/')}$`));
    await context.close();
  });

  test(`unprefixed ${route} redirects zh-CN query to prefixed route`, async ({ page }) => {
    await page.goto(`${route}?lang=zh-CN`);
    await expect(page).toHaveURL(new RegExp(`/zh-CN${route.replace(/\//g, '\\/')}(?:\\?lang=zh-CN)?$`));
  });

  test(`prefixed ${route} should not auto redirect`, async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'lang',
        value: 'zh-HK',
        domain: '127.0.0.1',
        path: '/',
      },
    ]);
    await page.goto(`/en${route}`);
    await expect(page).toHaveURL(new RegExp(`/en${route.replace(/\//g, '\\/')}$`));
  });
}

for (const route of phaseTwoJumpRoutes) {
  test(`jump page ${route} keeps English fallback without JavaScript`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(route);
    await expect(page.locator('body')).toContainText(/Support|Status|nmTeam/);
    await expect(page).toHaveURL(new RegExp(`${route.replace(/\//g, '\\/')}$`));
    await context.close();
  });
}

test('prefixed zh-CN route should not auto redirect', async ({ page }) => {
  await page.context().addCookies([
    {
      name: 'lang',
      value: 'en',
      domain: '127.0.0.1',
      path: '/',
    },
  ]);
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
