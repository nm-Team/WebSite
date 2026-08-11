import { expect, test } from '@playwright/test';

import { routeManifest, toPrefixedPath, toRootPath } from '@/i18n/routes';

const contentPaths = Array.from(new Set([
  ...routeManifest.map((route) => toRootPath(route.slug)),
  ...routeManifest.flatMap((route) => route.supportedLocales.map((locale) => toPrefixedPath(locale, route.slug))),
  '/404.html',
]));

test.use({ javaScriptEnabled: false });

test('all content routes expose one continuous heading hierarchy', async ({ context, page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Heading semantics are viewport-independent.');
  test.setTimeout(120_000);

  await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());

  const violations: string[] = [];

  for (const path of contentPaths) {
    const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
    if (!response?.ok()) {
      violations.push(`${path}: returned ${response?.status() ?? 'no response'}`);
      continue;
    }

    const headings = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll((nodes) => nodes.map((node) => ({
      level: Number(node.tagName.slice(1)),
      text: node.textContent?.trim().replace(/\s+/g, ' ') ?? '',
    })));
    const h1Count = headings.filter(({ level }) => level === 1).length;

    if (h1Count !== 1) {
      violations.push(`${path}: expected one h1, found ${h1Count}`);
    }
    if (headings[0]?.level !== 1) {
      violations.push(`${path}: first heading is h${headings[0]?.level ?? 'none'}`);
    }

    for (let index = 1; index < headings.length; index += 1) {
      const previous = headings[index - 1];
      const current = headings[index];
      if (previous && current && current.level > previous.level + 1) {
        violations.push(`${path}: h${previous.level} "${previous.text}" skips to h${current.level} "${current.text}"`);
      }
    }
  }

  expect(violations).toEqual([]);
});
