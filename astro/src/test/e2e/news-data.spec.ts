import { expect, test } from '@playwright/test';

test('escapes newsroom content before rendering article cards', async ({ page }) => {
  await page.route('https://newsroom.nmteam.xyz/api/posts**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: 200,
        data: [{
          permalink: 'javascript:alert(1)',
          title: '<strong>Injected HTML</strong>',
          text: '',
          year: 2026,
          month: 9,
          day: 21,
        }],
      }),
    });
  });

  await page.goto('/zh-CN/', { waitUntil: 'domcontentloaded' });

  const card = page.locator('#newsSwiperItems .swiper-slide');
  await expect(card.locator('h3')).toHaveText('<strong>Injected HTML</strong>');
  await expect(card.locator('strong')).toHaveCount(0);
  await expect(card).toHaveAttribute('href', '#');
});
