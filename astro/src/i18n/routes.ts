import type { PublicLocale } from '@/i18n/locales';

export type RouteEntry = {
  slug: string[];
  kind: 'static-page' | 'listing-page' | 'custom-product-page';
  sourcePhpPath: string;
};

export const routeManifest: RouteEntry[] = [
  { slug: [], kind: 'static-page', sourcePhpPath: '/index.php' },
  { slug: ['aboutus'], kind: 'static-page', sourcePhpPath: '/aboutus.php' },
  { slug: ['cookies'], kind: 'static-page', sourcePhpPath: '/cookies.php' },
  { slug: ['business-cooperation'], kind: 'static-page', sourcePhpPath: '/business_cooperation.php' },
  { slug: ['supportus'], kind: 'static-page', sourcePhpPath: '/supportus.php' },
  { slug: ['products'], kind: 'listing-page', sourcePhpPath: '/products/index.php' },
  { slug: ['products', 'overview', 'nmBot-Telegram'], kind: 'custom-product-page', sourcePhpPath: '/products/template/nmBot-Telegram.php' },
];

export function toPrefixedPath(locale: PublicLocale, slug: string[]): string {
  if (slug.length === 0) {
    return `/${locale}/`;
  }

  return `/${locale}/${slug.join('/')}/`;
}

export function toRootPath(slug: string[]): string {
  if (slug.length === 0) {
    return '/';
  }

  return `/${slug.join('/')}/`;
}
