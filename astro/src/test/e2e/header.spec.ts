import { expect, type Locator, test } from '@playwright/test';

function cssTimeToMilliseconds(value: string): number {
  const time = Number.parseFloat(value);

  if (!Number.isFinite(time)) {
    throw new Error(`Invalid CSS time value: ${value}`);
  }

  return value.endsWith('ms') ? time : time * 1_000;
}

async function transitionDelayFor(locator: Locator, property: string): Promise<number> {
  const delay = await locator.evaluate((element, targetProperty) => {
    const style = getComputedStyle(element);
    const properties = style.transitionProperty.split(',').map((value) => value.trim());
    const delays = style.transitionDelay.split(',').map((value) => value.trim());
    const propertyIndex = properties.indexOf(targetProperty);

    if (propertyIndex === -1) {
      throw new Error(`Missing transition for ${targetProperty}: ${style.transitionProperty}`);
    }

    return delays[propertyIndex % delays.length];
  }, property);

  return cssTimeToMilliseconds(delay);
}

test('starts scroll-driven header transitions without delay', async ({ page }) => {
  await page.goto('/');

  const header = page.locator('#pageHeader');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(header).not.toHaveClass(/\bhidden\b/);

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).toHaveClass(/\bhidden\b/);
  await expect(header).not.toHaveAttribute('data-closing');

  expect(await transitionDelayFor(header, 'background-color')).toBe(0);
  expect(await transitionDelayFor(header, 'backdrop-filter')).toBe(0);
});

test('keeps the legacy stagger scoped to mobile menu closing', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'The navigation toggle is only visible in the mobile layout.');

  await page.goto('/aboutus/');

  const header = page.locator('#pageHeader');
  const menuToggle = page.locator('#menu-toggle');

  await menuToggle.click();
  await expect(header).toHaveAttribute('open', 'true');

  await menuToggle.click();
  await expect(header).not.toHaveAttribute('open');
  await expect(header).toHaveAttribute('data-closing', 'true');

  expect(await transitionDelayFor(header, 'background-color')).toBe(500);
  expect(await transitionDelayFor(header, 'backdrop-filter')).toBe(550);

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(header).not.toHaveAttribute('data-closing');
  await expect(header).not.toHaveClass(/\bhidden\b/);

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).toHaveClass(/\bhidden\b/);
  expect(await transitionDelayFor(header, 'background-color')).toBe(0);
  expect(await transitionDelayFor(header, 'backdrop-filter')).toBe(0);

  await menuToggle.click();
  await menuToggle.click();
  await expect(header).toHaveAttribute('data-closing', 'true');
  await expect(header).not.toHaveAttribute('data-closing', { timeout: 1_500 });
});
