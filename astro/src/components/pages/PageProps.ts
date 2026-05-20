import type { PublicLocale } from '@/i18n/locales';
import type { RouteEntry } from '@/i18n/routes';

export interface PageProps {
  route: RouteEntry;
  locale: PublicLocale;
}
