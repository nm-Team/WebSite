import { defaultLocale, type PublicLocale, publicLocales } from '@/i18n/locales';
import { type RouteEntry, routeManifest, toPrefixedPath, toRootPath } from '@/i18n/routes';
import { getPageMetadata } from '@/utils/page-metadata';

export const siteOrigin = 'https://nm.team';

export type SitemapEntry = {
  route: RouteEntry;
  locale: PublicLocale;
  path: string;
  url: string;
  title: string;
  description: string;
  isRootFallback: boolean;
};

export function getSitemapEntries(): SitemapEntry[] {
  const rootEntries = routeManifest
    .filter((route) => route.inSitemap !== false && route.supportedLocales.includes(defaultLocale))
    .map((route) => {
      const path = toRootPath(route.slug);
      const metadata = getPageMetadata(route, defaultLocale);
      return {
        route,
        locale: defaultLocale,
        path,
        url: new URL(path, siteOrigin).toString(),
        title: metadata.title || 'nmTeam',
        description: metadata.description,
        isRootFallback: true,
      };
    });

  const localizedEntries = routeManifest
    .filter((route) => route.inSitemap !== false)
    .flatMap((route) =>
    publicLocales
      .filter((locale) => route.supportedLocales.includes(locale))
      .map((locale) => {
        const path = toPrefixedPath(locale, route.slug);
        const metadata = getPageMetadata(route, locale);
        return {
          route,
          locale,
          path,
          url: new URL(path, siteOrigin).toString(),
          title: metadata.title || 'nmTeam',
          description: metadata.description,
          isRootFallback: false,
        };
      }),
  );

  return [...rootEntries, ...localizedEntries];
}
