import { type PublicLocale, publicLocales } from '../../i18n/locales';
import { newsroomPath } from './paths';

interface LocalizedPage { locale: PublicLocale; url: string }
export interface NewsroomFallbackPage extends LocalizedPage { kind: 'redirect'; destination: string }

export function selectNewsroomTranslation<T extends { locale: PublicLocale }>(translations: readonly T[], locale: PublicLocale): T | undefined {
  for (const candidate of new Set([locale, 'en', 'zh-CN'])) {
    const translation = translations.find((page) => page.locale === candidate);
    if (translation) return translation;
  }
}

export function getNewsroomFallbackPages(pages: readonly LocalizedPage[]): NewsroomFallbackPage[] {
  const groups = new Map<string, LocalizedPage[]>();
  for (const page of pages) {
    const suffix = page.url.slice(newsroomPath(page.locale).length);
    const translations = groups.get(suffix) ?? [];
    translations.push(page);
    groups.set(suffix, translations);
  }
  return [...groups].flatMap(([suffix, translations]) => publicLocales.flatMap((locale) => {
    const target = selectNewsroomTranslation(translations, locale);
    if (!target) throw new Error(`No English or Chinese fallback for Newsroom page: ${locale}/${suffix}`);
    return target.locale === locale ? [] : [{ kind: 'redirect' as const, locale, url: newsroomPath(locale, suffix), destination: target.url }];
  }));
}
