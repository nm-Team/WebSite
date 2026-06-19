import { type PublicLocale, publicLocales } from '@/i18n/locales';

const localizableSchemes = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

export function toLocalizedHref(locale: PublicLocale, href: string): string {
  if (!href.startsWith('/') || localizableSchemes.test(href)) {
    return href;
  }

  const [pathAndSearch, hash = ''] = href.split('#', 2);
  const [pathname, search = ''] = pathAndSearch.split('?', 2);
  const firstSegment = pathname.split('/').filter(Boolean)[0];

  if (publicLocales.includes(firstSegment as PublicLocale)) {
    return href;
  }

  const localizedPath = pathname === '/' ? `/${locale}/` : `/${locale}${pathname}`;
  const searchPart = search ? `?${search}` : '';
  const hashPart = hash ? `#${hash}` : '';

  return `${localizedPath}${searchPart}${hashPart}`;
}

export function removeLocalePrefix(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (!publicLocales.includes(firstSegment as PublicLocale)) {
    return pathname || '/';
  }

  const unprefixedSegments = segments.slice(1);
  return unprefixedSegments.length === 0 ? '/' : `/${unprefixedSegments.join('/')}/`;
}

export function localizeHtmlHrefs(locale: PublicLocale, html: string): string {
  return html.replace(/\bhref=(["'])(\/(?!\/)[^"']*)\1/g, (_match, quote: string, href: string) => {
    return `href=${quote}${toLocalizedHref(locale, href)}${quote}`;
  });
}
