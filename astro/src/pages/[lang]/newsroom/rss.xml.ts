import type { APIRoute } from 'astro';

import manifest from '@/data/newsroom/import-manifest.json';
import { getNewsPosts } from '@/lib/newsroom/content';
import { newsroomLabels } from '@/lib/newsroom/labels';
import { absoluteNewsroomUrl, isNewsroomLocale, legacyNewsroomOrigin, newsroomLocales, newsroomPath } from '@/lib/newsroom/paths';

const escapeXml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
export const getStaticPaths = () => newsroomLocales.map((lang) => ({ params: { lang } }));
export const GET: APIRoute = async ({ params }) => {
  if (!isNewsroomLocale(params.lang)) throw new Error(`Invalid Newsroom locale: ${params.lang}`);
  const locale = params.lang;
  const labels = newsroomLabels(locale);
  const posts = await getNewsPosts(locale);
  const imported = new Set(manifest.articles.map((article) => article.articleId));
  const items = posts.map((post) => {
    const link = absoluteNewsroomUrl(post.url);
    const guid = locale === 'zh-CN' && imported.has(post.articleId) ? `${legacyNewsroomOrigin}/news/${post.slug}/` : link;
    return `<item><title>${escapeXml(post.title)}</title><link>${escapeXml(link)}</link><guid isPermaLink="${guid === link}">${escapeXml(guid)}</guid><description>${escapeXml(post.excerpt)}</description><pubDate>${new Date(post.dateTime).toUTCString()}</pubDate></item>`;
  }).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${escapeXml(labels.title)}</title><description>${escapeXml(labels.description)}</description><link>${absoluteNewsroomUrl(newsroomPath(locale))}</link><atom:link href="${absoluteNewsroomUrl(newsroomPath(locale, 'rss.xml'))}" rel="self" type="application/rss+xml"/><language>${locale}</language>${posts[0] ? `<lastBuildDate>${new Date(posts[0].dateTime).toUTCString()}</lastBuildDate>` : ''}${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'X-Robots-Tag': 'noindex, follow' } });
};
