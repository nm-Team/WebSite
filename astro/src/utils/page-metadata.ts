import { getProductDetail } from '@/data/products/loader';
import type { PublicLocale } from '@/i18n/locales';
import type { RouteEntry } from '@/i18n/routes';
import { t } from '@/i18n/translate';

export function getPageMetadata(route: RouteEntry, locale: PublicLocale): { title: string; description: string } {
  if (route.kind === 'generic-product-page') {
    if (!route.productSlug) {
      throw new Error(`Product route ${route.id} is missing its product slug.`);
    }

    const product = getProductDetail(locale, route.productSlug);
    return {
      title: `${product.page.productName} - ${t(locale, 'products.title')}`,
      description: product.page.description,
    };
  }

  return {
    title: route.pageTitle ? t(locale, route.pageTitle) : '',
    description: route.pageDescription ? t(locale, route.pageDescription) : '',
  };
}
