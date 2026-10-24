import { describe, expect, it } from 'vitest';

import { publicLocales } from '@/i18n/locales';
import { routeManifest, toPrefixedPath, toRootPath } from '@/i18n/routes';
import { t } from '@/i18n/translate';
import { getSitemapEntries } from '@/utils/site-map';

describe('generated sitemap entries', () => {
  it.each([
    ['/nmBrowser-StartPage/', 'nmBrowser StartPage - Products', 'Search the web, open your favorite links, and personalize a simple browser start page.'],
    ['/product-accessibility/', 'Accessibility - Products', 'Learn about keyboard navigation, focus indicators, and alternative text in nmTeam products.'],
    ['/zh-CN/nmBrowser-StartPage/', 'nmBrowser 启动页 - 产品', '简洁、可定制的浏览器启动页，让您轻松搜索网页、访问常用链接。'],
    ['/zh-CN/product-accessibility/', '辅助功能 - 产品', '了解 nmTeam 产品中的键盘导航、焦点提示和替代文本等辅助功能。'],
  ])('uses the product title and introduction for %s', (path, title, description) => {
    expect(getSitemapEntries().find((entry) => entry.path === path)).toMatchObject({ title, description });
  });

  it('gives every localized product its own plain-text metadata', () => {
    const entries = getSitemapEntries().filter((entry) => entry.route.kind === 'generic-product-page');
    expect(entries).toHaveLength(2 * (publicLocales.length + 1));

    for (const entry of entries) {
      expect(entry.title).not.toBe(t(entry.locale, 'products.title'));
      expect(entry.description.trim()).not.toBe('');
      expect(entry.description).not.toBe(t(entry.locale, 'products.description'));
      expect(entry.description).not.toMatch(/<[^>]+>|\[tip\]/);
    }
  });

  it('contains every root and supported prefixed route', () => {
    const paths = new Set(getSitemapEntries().map((entry) => entry.path));

    for (const route of routeManifest) {
      if (route.inSitemap === false) {
        continue;
      }
      expect(paths.has(toRootPath(route.slug))).toBe(true);
      for (const locale of publicLocales) {
        if (route.supportedLocales.includes(locale)) {
          expect(paths.has(toPrefixedPath(locale, route.slug))).toBe(true);
        }
      }
    }
  });

  it('omits routes excluded from the sitemap', () => {
    const entries = getSitemapEntries().filter((entry) => entry.route.inSitemap === false);
    expect(entries).toHaveLength(0);
    expect(getSitemapEntries().some((entry) => entry.route.id === 'questionnaire-ended')).toBe(false);
  });

  it('uses absolute production URLs', () => {
    for (const entry of getSitemapEntries()) {
      expect(entry.url).toMatch(/^https:\/\/nm\.team\//);
    }
  });
});
