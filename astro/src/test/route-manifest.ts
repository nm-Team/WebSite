import { publicLocales } from '@/i18n/locales';
import { routeManifest, toPrefixedPath, toRootPath } from '@/i18n/routes';

export const comparisonMatrix = {
  locales: publicLocales,
  viewports: [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 1000 },
  ],
};

export function enumerateComparableRoutes() {
  return routeManifest.flatMap((route) => {
    const rootPath = toRootPath(route.slug);
    const localizedPaths = publicLocales.map((locale) => toPrefixedPath(locale, route.slug));
    return [rootPath, ...localizedPaths];
  });
}
