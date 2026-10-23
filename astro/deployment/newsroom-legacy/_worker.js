const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'X-Robots-Tag': 'noindex, nofollow',
};

export default {
  /** @param {Request} request */
  fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
    if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405, headers: { ...corsHeaders, Allow: 'GET, HEAD, OPTIONS' } });
    const target = new URL('https://nm.team/newsroom/api/posts');
    target.search = new URL(request.url).search;
    return new Response(null, { status: 301, headers: { ...corsHeaders, Location: target.href, 'Cache-Control': 'public, max-age=300' } });
  },
};
