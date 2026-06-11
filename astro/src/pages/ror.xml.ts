import type { APIRoute } from 'astro';

import { getSitemapEntries } from '@/utils/site-map';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = () => {
  const items = getSitemapEntries()
    .map(
      (entry) =>
        `  <item><title>${escapeXml(entry.title)}</title><link>${escapeXml(entry.url)}</link><description>${escapeXml(entry.description)}</description></item>`,
    )
    .join('\n');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>nmTeam Sitemap</title>\n${items}\n</channel></rss>\n`, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};

