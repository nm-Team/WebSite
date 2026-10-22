import { describe, expect, it } from 'vitest';

import { publicLocales } from '@/i18n/locales';
import { getNewsroomFallbackPages, selectNewsroomTranslation } from '@/lib/newsroom/fallbacks';

describe('Newsroom translation fallback', () => {
  it('prefers the requested translation, then English, then Chinese', () => {
    const translations = [{ locale: 'zh-CN' }, { locale: 'en' }, { locale: 'ja-JP' }] as const;
    expect(selectNewsroomTranslation(translations, 'ja-JP')?.locale).toBe('ja-JP');
    expect(selectNewsroomTranslation(translations, 'zh-HK')?.locale).toBe('en');
    expect(selectNewsroomTranslation(translations.slice(0, 1), 'en')?.locale).toBe('zh-CN');
    expect(selectNewsroomTranslation([], 'en')).toBeUndefined();
  });

  it('generates every missing locale and targets real pages without redirect chains', () => {
    const pages = [
      { locale: 'zh-CN', url: '/zh-CN/newsroom/shared/' },
      { locale: 'en', url: '/en/newsroom/shared/' },
      { locale: 'zh-CN', url: '/zh-CN/newsroom/chinese-only/' },
    ] as const;
    const redirects = getNewsroomFallbackPages(pages);
    expect(redirects).toHaveLength(publicLocales.length * 2 - pages.length);
    for (const redirect of redirects) {
      expect(pages.some((page) => page.url === redirect.destination)).toBe(true);
      expect(pages.some((page) => page.url === redirect.url)).toBe(false);
      expect(redirect.destination).toBe(redirect.url.endsWith('/shared/') ? '/en/newsroom/shared/' : '/zh-CN/newsroom/chinese-only/');
    }
  });
});
