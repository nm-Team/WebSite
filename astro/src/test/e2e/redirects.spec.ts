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

test('join forum redirects allowed job type to legacy questionnaire path', async ({ page }) => {
  await page.goto('/join/forum/?jobType=writer');
  await expect(page).toHaveURL(/\/blackboard\/questionnaire\/22_07_04_join_nmteam_writer$/);
});

test('join forum sanitizes unknown job type before redirecting', async ({ page }) => {
  await page.goto('/join/forum/?jobType=../../bad');
  await expect(page).toHaveURL(/\/blackboard\/questionnaire\/22_07_04_join_nmteam_developer$/);
});
