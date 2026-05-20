import type { APIRoute } from 'astro';

import { getSitemapEntries } from '@/utils/site-map';

export const GET: APIRoute = () =>
  new Response(`${getSitemapEntries().map((entry) => entry.url).join('\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });

