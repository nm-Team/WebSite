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
      expect(route.supportedLocales).toEqual(publicLocales);
    }
  });
});
