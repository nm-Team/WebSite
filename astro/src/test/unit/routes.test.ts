import { describe, expect, it } from 'vitest';

import { publicLocales } from '@/i18n/locales';
import { routeManifest, toPrefixedPath, toRootPath } from '@/i18n/routes';

describe('route manifest', () => {
  it('contains unique root paths', () => {
    const all = routeManifest.map((entry) => toRootPath(entry.slug));
    expect(new Set(all).size).toBe(all.length);
  });

  it('builds prefixed locale paths', () => {
    expect(toPrefixedPath('zh-CN', ['aboutus'])).toBe('/zh-CN/aboutus/');
    expect(toPrefixedPath('en', [])).toBe('/en/');
  });

  it('contains phase-0 required metadata', () => {
    for (const route of routeManifest) {
      expect(route.id.length).toBeGreaterThan(0);
      expect(route.sourcePhpPath.endsWith('.php')).toBe(true);
      expect(route.renderMode).toBe('static');
      expect(route.expectedRedirect).toBe('root-may-redirect');
      expect(route.supportedLocales.length).toBeGreaterThan(0);
      expect(route.supportedLocales.every((locale) => publicLocales.includes(locale))).toBe(true);
    }
  });

  it('covers phase-5 legacy routes', () => {
    const requiredSources = [
      '/index.php',
      '/join/index.php',
      '/join/forum.php',
      '/language.php',
      '/sitemap.php',
    ];

    expect(routeManifest.map((route) => route.sourcePhpPath)).toEqual(expect.arrayContaining(requiredSources));
  });

  it('omits generic product detail locales when JSON data is unavailable', () => {
    const startPage = routeManifest.find((route) => route.productSlug === 'nmBrowser-StartPage');
    const accessibility = routeManifest.find((route) => route.productSlug === 'product-accessibility');

    expect(startPage?.supportedLocales).toEqual(['en', 'zh-CN', 'zh-HK', 'zh-x-mars']);
    expect(accessibility?.supportedLocales).toEqual(['en', 'zh-CN', 'zh-HK', 'zh-x-mars']);
  });
});
