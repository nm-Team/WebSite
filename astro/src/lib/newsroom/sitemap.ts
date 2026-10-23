import { newsroomLabels } from './labels';
import { getNewsroomAlternates, getNewsroomPages } from './pages';
import { absoluteNewsroomUrl } from './paths';

export async function getNewsroomSitemapEntries() {
  const pages = await getNewsroomPages();
  return pages.filter((page) => page.kind !== 'search').map((page) => ({
    locale: page.locale,
    path: page.url,
    url: absoluteNewsroomUrl(page.url),
    title: page.title,
    description: page.kind === 'article' ? page.post.description : newsroomLabels(page.locale).description,
    lastmod: page.kind === 'article' ? page.post.updatedDateTime ?? page.post.dateTime : undefined,
    alternates: getNewsroomAlternates(page, pages),
  }));
}
