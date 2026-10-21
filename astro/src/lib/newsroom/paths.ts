export const newsroomLocales = ['zh-CN', 'en'] as const;
export type NewsroomLocale = (typeof newsroomLocales)[number];

export const newsroomOrigin = 'https://nm.team';
export const legacyNewsroomOrigin = 'https://newsroom.nmteam.xyz';
export const postsPerPage = 11;
export const defaultNewsImage = '/newsroom/default-post-image.png';

export function isNewsroomLocale(value: string): value is NewsroomLocale {
  return value === 'zh-CN' || value === 'en';
}

export function resolveNewsroomLocale(value: string): NewsroomLocale {
  return value.startsWith('zh') ? 'zh-CN' : 'en';
}

export function newsroomPath(locale: NewsroomLocale, suffix = ''): string {
  return `/${locale}/newsroom/${suffix.replace(/^\/+/, '')}`;
}

export function publicationDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => {
    const value = parts.find((item) => item.type === type)?.value;
    if (!value) throw new Error(`Missing ${type} in publication date ${date.toISOString()}`);
    return value;
  };
  return { year: part('year'), month: part('month'), day: part('day') };
}

export function articleSlug(articleId: string, date: Date): string {
  const { year, month, day } = publicationDateParts(date);
  return `${articleId}-${year}-${month}-${day}`;
}

export function articlePath(locale: NewsroomLocale, articleId: string, date: Date): string {
  return newsroomPath(locale, `${articleSlug(articleId, date)}/`);
}

export function absoluteNewsroomUrl(path: string): string {
  return new URL(path, newsroomOrigin).href;
}
