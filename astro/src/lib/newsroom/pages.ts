import { getAllNewsPosts, getArchives, getCategories, getTags, type NewsPost } from './content';
import { newsroomLabels } from './labels';
import { type NewsroomLocale, newsroomLocales, newsroomPath, postsPerPage } from './paths';

interface PageBase { locale: NewsroomLocale; url: string; title: string }
type NewsroomListPage = PageBase & {
  kind: 'list';
  posts: NewsPost[];
  currentPage: number;
  totalPages: number;
  paginationBaseUrl: string;
};
type NewsroomArticlePage = PageBase & { kind: 'article'; post: NewsPost; latestPosts: NewsPost[] };
type NewsroomSearchPage = PageBase & { kind: 'search' };
export type NewsroomPage = NewsroomListPage | NewsroomArticlePage | NewsroomSearchPage;
export interface NewsroomAlternate { locale: NewsroomLocale; url: string }

function createListPages(locale: NewsroomLocale, baseUrl: string, title: string, posts: NewsPost[]): NewsroomListPage[] {
  const paginationBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const totalPages = Math.max(1, Math.ceil(posts.length / postsPerPage));
  return Array.from({ length: totalPages }, (_, index) => {
    const currentPage = index + 1;
    const pageName = title === newsroomLabels(locale).title ? 'Newsroom' : title;
    const pageTitle = currentPage === 1
      ? title
      : `${pageName} - ${locale === 'en' ? `Page ${currentPage}` : `第 ${currentPage} 页`}`;
    return {
      kind: 'list', locale,
      url: currentPage === 1 ? paginationBaseUrl : `${paginationBaseUrl}page/${currentPage}/`,
      title: pageTitle,
      posts: posts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage),
      currentPage, totalPages, paginationBaseUrl,
    };
  });
}

export async function getNewsroomPages(): Promise<NewsroomPage[]> {
  const allPosts = await getAllNewsPosts();
  const pages: NewsroomPage[] = [];
  for (const locale of newsroomLocales) {
    const posts = allPosts.filter((post) => post.locale === locale);
    const labels = newsroomLabels(locale);
    pages.push(...createListPages(locale, newsroomPath(locale), labels.title, posts));
    for (const category of getCategories(posts)) pages.push(...createListPages(locale, category.url, category.name, posts.filter((post) => post.category.slug === category.slug)));
    for (const tag of getTags(posts)) pages.push(...createListPages(locale, tag.url, tag.name, posts.filter((post) => post.tags.some((item) => item.slug === tag.slug))));
    for (const archive of getArchives(posts, locale)) pages.push(...createListPages(locale, archive.url, archive.label, posts.filter((post) => post.archiveKey === archive.key)));
    for (const post of posts) pages.push({ kind: 'article', locale, url: post.url, title: post.title, post, latestPosts: posts.filter((item) => item.articleId !== post.articleId).slice(0, 8) });
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
