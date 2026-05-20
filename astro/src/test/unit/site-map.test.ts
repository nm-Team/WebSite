import { describe, expect, it } from 'vitest';

import { publicLocales } from '@/i18n/locales';
import { routeManifest, toPrefixedPath, toRootPath } from '@/i18n/routes';
import { getSitemapEntries } from '@/utils/site-map';

describe('generated sitemap entries', () => {
  it('contains every root and supported prefixed route', () => {
    const paths = new Set(getSitemapEntries().map((entry) => entry.path));

    for (const route of routeManifest) {
      expect(paths.has(toRootPath(route.slug))).toBe(true);
      for (const locale of publicLocales) {
        if (route.supportedLocales.includes(locale)) {
          expect(paths.has(toPrefixedPath(locale, route.slug))).toBe(true);
        }
      }
    }
  });

  it('uses absolute production URLs', () => {
    for (const entry of getSitemapEntries()) {
      expect(entry.url).toMatch(/^https:\/\/nmteam\.xyz\//);
    }
  });
});
