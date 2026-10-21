import type { APIRoute } from 'astro';

import { absoluteNewsroomUrl } from '@/lib/newsroom/paths';
import { getNewsroomSitemapEntries } from '@/lib/newsroom/sitemap';
import { getSitemapEntries } from '@/utils/site-map';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async () => {
  const entries = [...getSitemapEntries(), ...await getNewsroomSitemapEntries()];
  const items = entries
    .map((entry) => {
      const alternates = 'alternates' in entry ? entry.alternates.map((alternate) => `<xhtml:link rel="alternate" hreflang="${alternate.locale}" href="${escapeXml(absoluteNewsroomUrl(alternate.url))}"/>`).join('') : '';
      const lastmod = 'lastmod' in entry && entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : '';
      return `  <url><loc>${escapeXml(entry.url)}</loc>${lastmod}${alternates}</url>`;
    })
    .join('\n');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${items}\n</urlset>\n`, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};

