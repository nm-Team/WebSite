import { expect, test } from '@playwright/test';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const phaseTwoRoutes = [
  '/',
  '/aboutus/',
  '/join/',
  '/language/',
  '/sitemap/',
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
    await expect(page).toHaveURL(new RegExp(`${escapeRegExp(route)}$`));
    await context.close();
  });

  test(`unprefixed ${route} redirects zh-CN query to prefixed route`, async ({ page }) => {
    await page.goto(`${route}?lang=zh-CN`);
    await expect(page).toHaveURL(new RegExp(`/zh-CN${escapeRegExp(route)}(?:\\?lang=zh-CN)?$`));
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
    await expect(page).toHaveURL(new RegExp(`/en${escapeRegExp(route)}$`));
  });
}

for (const route of phaseTwoJumpRoutes) {
  test(`jump page ${route} keeps English fallback without JavaScript`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(route);
    await expect(page.locator('body')).toContainText(/Support|Status|nmTeam/);
    await expect(page).toHaveURL(new RegExp(`${escapeRegExp(route)}$`));
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

test('unprefixed route redirects from saved zh-CN cookie before rendering English content', async ({ page }) => {
  await page.context().addCookies([
    {
      name: 'lang',
      value: 'zh-CN',
      domain: '127.0.0.1',
      path: '/',
    },
  ]);
  await page.goto('/aboutus/');
  await expect(page).toHaveURL(/\/zh-CN\/aboutus\/$/);
});

test('language switch rewrites prefixed back URL to selected locale', async ({ page }) => {
  await page.goto('/en/language/?bks=http%3A%2F%2F127.0.0.1%3A4321%2Fen%2Faboutus%2F');
  await page.locator('[data-lanid="zh-CN"]').click();
  await expect(page).toHaveURL(/\/zh-CN\/aboutus\/$/);
});

test('join forum redirects to retired questionnaire notice page', async ({ page }) => {
  await page.goto('/join/forum/?jobType=writer');
  await expect(page).toHaveURL(/\/questionnaire-ended\/$/);
});

test('join forum redirects to retired questionnaire notice page for unknown job type too', async ({ page }) => {
  await page.goto('/join/forum/?jobType=../../bad');
  await expect(page).toHaveURL(/\/questionnaire-ended\/$/);
});

const phpRedirectCases = [
  { from: '/aboutus.php', to: '/aboutus/' },
  { from: '/products/template/nmBot-Telegram.php', to: '/products/template/nmBot-Telegram/' },
  { from: '/zh-CN/legal/privacy-policy.php', to: '/zh-CN/legal/privacy-policy/' },
  { from: '/zh-CN/products/index.php', to: '/zh-CN/products/' },
  { from: '/business_cooperation.php', to: '/business-cooperation/' },
  { from: '/zh-CN/business_cooperation.php', to: '/zh-CN/business-cooperation/' },
];

for (const { from, to } of phpRedirectCases) {
  test(`legacy php route ${from} redirects to ${to}`, async ({ page }) => {
    await page.goto(from);
    await expect(page).toHaveURL(new RegExp(`${escapeRegExp(to)}$`));
  });
}

const phpExternalRedirectCases = [
  { from: '/support/index.php', to: 'https://support.nmteam.xyz' },
  { from: '/status.php', to: 'https://status.nmteam.xyz' },
  { from: '/zh-CN/support/index.php', to: 'https://support.nmteam.xyz' },
  { from: '/zh-CN/status.php', to: 'https://status.nmteam.xyz' },
];

for (const { from, to } of phpExternalRedirectCases) {
  test(`legacy php jump page ${from} redirects to ${to}`, async ({ page }) => {
    await page.goto(from);
    await expect(page).toHaveURL(new RegExp(`^${escapeRegExp(to)}`));
  });
}
