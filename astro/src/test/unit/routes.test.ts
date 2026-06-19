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

  it('contains required route metadata', () => {
    for (const route of routeManifest) {
      expect(route.id.length).toBeGreaterThan(0);
      expect(route.sourcePhpPath.endsWith('.php')).toBe(true);
      expect(route.supportedLocales.length).toBeGreaterThan(0);
      expect(route.supportedLocales.every((locale) => publicLocales.includes(locale))).toBe(true);
    }
  });

  it('covers legacy PHP entry points', () => {
    const requiredSources = [
      '/index.php',
      '/join/index.php',
      '/join/forum.php',
      '/language.php',
      '/sitemap.php',
    ];

    expect(routeManifest.map((route) => route.sourcePhpPath)).toEqual(expect.arrayContaining(requiredSources));
  });

  it('exposes generic product detail routes for every locale with data', () => {
    const startPage = routeManifest.find((route) => route.productSlug === 'nmBrowser-StartPage');
    const accessibility = routeManifest.find((route) => route.productSlug === 'product-accessibility');

    expect(startPage?.supportedLocales).toEqual(publicLocales);
    expect(accessibility?.supportedLocales).toEqual(publicLocales);
  });
});
