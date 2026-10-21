import { getAllNewsPosts, getArchives, getCategories, getTags, type NewsPost } from './content';
import { newsroomLabels } from './labels';
import { type NewsroomLocale, newsroomLocales, newsroomPath, postsPerPage } from './paths';

interface PageBase { locale: NewsroomLocale; url: string; title: string }
export type NewsroomPage = PageBase & (
  | { kind: 'list'; posts: NewsPost[]; currentPage?: number; totalPages?: number }
  | { kind: 'article'; post: NewsPost; latestPosts: NewsPost[] }
  | { kind: 'search' | 'about' }
);
export interface NewsroomAlternate { locale: NewsroomLocale; url: string }

export async function getNewsroomPages(): Promise<NewsroomPage[]> {
  const allPosts = await getAllNewsPosts();
  const pages: NewsroomPage[] = [];
  for (const locale of newsroomLocales) {
    const posts = allPosts.filter((post) => post.locale === locale);
    const labels = newsroomLabels(locale);
    const totalPages = Math.max(1, Math.ceil(posts.length / postsPerPage));
    for (let page = 1; page <= totalPages; page++) {
      pages.push({
        kind: 'list', locale, url: newsroomPath(locale, page === 1 ? '' : `page/${page}/`),
        title: page === 1 ? labels.title : locale === 'en' ? `Newsroom — Page ${page}` : `Newsroom — 第 ${page} 页`,
        posts: posts.slice((page - 1) * postsPerPage, page * postsPerPage), currentPage: page, totalPages,
      });
    }
    for (const category of getCategories(posts)) pages.push({ kind: 'list', locale, url: category.url, title: category.name, posts: posts.filter((post) => post.category.slug === category.slug) });
    for (const tag of getTags(posts)) pages.push({ kind: 'list', locale, url: tag.url, title: tag.name, posts: posts.filter((post) => post.tags.some((item) => item.slug === tag.slug)) });
    for (const archive of getArchives(posts, locale)) pages.push({ kind: 'list', locale, url: archive.url, title: archive.label, posts: posts.filter((post) => post.archiveKey === archive.key) });
    for (const post of posts) pages.push({ kind: 'article', locale, url: post.url, title: post.title, post, latestPosts: posts.filter((item) => item.articleId !== post.articleId).slice(0, 8) });
    pages.push({ kind: 'about', locale, url: newsroomPath(locale, 'about/'), title: labels.about });
    pages.push({ kind: 'search', locale, url: newsroomPath(locale, 'search/'), title: labels.search });
  }
  const urls = pages.map((page) => page.url);
  if (new Set(urls).size !== urls.length) throw new Error('Newsroom generated duplicate page URLs');
  return pages;
}

export function getNewsroomAlternates(page: NewsroomPage, pages: readonly NewsroomPage[]): NewsroomAlternate[] {
  const suffix = page.url.slice(newsroomPath(page.locale).length);
  return newsroomLocales.flatMap((locale) => {
    const url = newsroomPath(locale, suffix);
    return pages.some((candidate) => candidate.url === url) ? [{ locale, url }] : [];
  });
}
