import type { PublicLocale } from '@/i18n/locales';
import { publicLocales } from '@/i18n/locales';

export type RouteEntry = {
  id: string;
  slug: string[];
  kind: 'static-page' | 'listing-page' | 'custom-product-page';
  sourcePhpPath: string;
  supportedLocales: readonly PublicLocale[];
  renderMode: 'static' | 'dynamic';
  expectedRedirect: 'root-may-redirect' | 'prefixed-no-redirect';
};

export const routeManifest: RouteEntry[] = [
  {
    id: 'home',
    slug: [],
    kind: 'static-page',
    sourcePhpPath: '/index.php',
    supportedLocales: publicLocales,
    renderMode: 'static',
    expectedRedirect: 'root-may-redirect',
  },
  {
    id: 'aboutus',
    slug: ['aboutus'],
    kind: 'static-page',
    sourcePhpPath: '/aboutus.php',
    supportedLocales: publicLocales,
    renderMode: 'static',
    expectedRedirect: 'root-may-redirect',
  },
  {
    id: 'cookies',
    slug: ['cookies'],
    kind: 'static-page',
    sourcePhpPath: '/cookies.php',
    supportedLocales: publicLocales,
    renderMode: 'static',
    expectedRedirect: 'root-may-redirect',
  },
  {
    id: 'business-cooperation',
    slug: ['business-cooperation'],
    kind: 'static-page',
    sourcePhpPath: '/business_cooperation.php',
    supportedLocales: publicLocales,
    renderMode: 'static',
    expectedRedirect: 'root-may-redirect',
  },
  {
    id: 'supportus',
    slug: ['supportus'],
    kind: 'static-page',
    sourcePhpPath: '/supportus.php',
    supportedLocales: publicLocales,
    renderMode: 'static',
    expectedRedirect: 'root-may-redirect',
  },
  {
    id: 'products',
    slug: ['products'],
    kind: 'listing-page',
    sourcePhpPath: '/products/index.php',
    supportedLocales: publicLocales,
    renderMode: 'static',
    expectedRedirect: 'root-may-redirect',
  },
  {
    id: 'products-overview-nmbot-telegram',
    slug: ['products', 'overview', 'nmBot-Telegram'],
    kind: 'custom-product-page',
    sourcePhpPath: '/products/template/nmBot-Telegram.php',
    supportedLocales: publicLocales,
    renderMode: 'static',
    expectedRedirect: 'root-may-redirect',
  },
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
