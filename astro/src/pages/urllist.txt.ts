import type { APIRoute } from 'astro';

import { getNewsroomSitemapEntries } from '@/lib/newsroom/sitemap';
import { getSitemapEntries } from '@/utils/site-map';

export const GET: APIRoute = async () =>
  new Response(`${[...getSitemapEntries(), ...await getNewsroomSitemapEntries()].map((entry) => entry.url).join('\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });

