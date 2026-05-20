import { defaultLocale, type PublicLocale, publicLocales } from '@/i18n/locales';
import { type RouteEntry, routeManifest, toPrefixedPath, toRootPath } from '@/i18n/routes';
import { t } from '@/i18n/translate';

export const siteOrigin = 'https://nmteam.xyz';

export type SitemapEntry = {
  route: RouteEntry;
  locale: PublicLocale;
  path: string;
  url: string;
  title: string;
  description: string;
  isRootFallback: boolean;
};

function resolveText(locale: PublicLocale, keyOrText?: string): string {
  if (!keyOrText) {
    return '';
  }

  return t(locale, keyOrText);
}

export function getSitemapEntries(): SitemapEntry[] {
  const rootEntries = routeManifest
    .filter((route) => route.supportedLocales.includes(defaultLocale))
    .map((route) => {
      const path = toRootPath(route.slug);
      return {
        route,
        locale: defaultLocale,
        path,
        url: new URL(path, siteOrigin).toString(),
        title: resolveText(defaultLocale, route.pageTitle) || 'nmTeam',
        description: resolveText(defaultLocale, route.pageDescription),
        isRootFallback: true,
      };
    });

  const localizedEntries = routeManifest.flatMap((route) =>
    publicLocales
      .filter((locale) => route.supportedLocales.includes(locale))
      .map((locale) => {
        const path = toPrefixedPath(locale, route.slug);
        return {
          route,
          locale,
          path,
          url: new URL(path, siteOrigin).toString(),
          title: resolveText(locale, route.pageTitle) || 'nmTeam',
          description: resolveText(locale, route.pageDescription),
          isRootFallback: false,
        };
      }),
  );

  return [...rootEntries, ...localizedEntries];
}
