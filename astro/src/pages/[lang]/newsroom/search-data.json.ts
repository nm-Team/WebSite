import type { APIRoute } from 'astro';

import { getNewsPosts } from '@/lib/newsroom/content';
import { isNewsroomLocale, newsroomLocales } from '@/lib/newsroom/paths';
import type { SearchPost } from '@/lib/newsroom/search';

export const getStaticPaths = () => newsroomLocales.map((lang) => ({ params: { lang } }));
export const GET: APIRoute = async ({ params }) => {
  if (!isNewsroomLocale(params.lang)) throw new Error(`Invalid Newsroom locale: ${params.lang}`);
  const data: SearchPost[] = (await getNewsPosts(params.lang)).map((post) => ({ url: post.url, image: post.image, title: post.title, dateTime: post.dateTime, dateText: post.dateText, category: post.category.name, text: post.searchText, tags: post.tags.map((tag) => tag.name) }));
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow' } });
};
