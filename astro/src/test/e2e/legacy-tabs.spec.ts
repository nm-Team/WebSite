import { expect, test } from '@playwright/test';

test('keeps legacy tabs accessible across pages', async ({ page }) => {
  await page.goto('/zh-CN/join/');
  const joinTabs = page.locator('#joinTab .tabs__list button');
  await expect(joinTabs.nth(0)).toHaveAttribute('role', 'tab');
  await expect(joinTabs.nth(0)).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#joinTab .tabs__panel').nth(0)).toBeVisible();

  await joinTabs.nth(1).click();
  await expect(joinTabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#joinTab .tabs__panel').nth(0)).toBeHidden();
  await expect(page.locator('#joinTab .tabs__panel').nth(1)).toBeVisible();

  await page.goto('/zh-CN/supportus/');
  const sponsorTabs = page.locator('#sponsorTab .tabs__list button');
  await expect(sponsorTabs.nth(0)).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#sponsorTab .tabs__panel').nth(0)).toBeVisible();
  await expect(page.locator('#sponsorTab .tabs__panel').nth(1)).toBeHidden();
});
