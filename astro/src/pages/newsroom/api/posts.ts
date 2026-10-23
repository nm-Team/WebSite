import { legacyPostBySlug } from '@/data/newsroom/legacy-posts';
import { getNewsPosts } from '@/lib/newsroom/content';
import { absoluteNewsroomUrl } from '@/lib/newsroom/paths';

export async function GET() {
  const data = (await getNewsPosts('zh-CN')).slice(0, 5).map((post) => ({
    cid: legacyPostBySlug.get(post.articleId)?.cid,
    title: post.title,
    slug: post.articleId,
    created: post.created,
    text: `[image]: ${absoluteNewsroomUrl(post.image)}\n\n${post.entry.body}`,
    permalink: absoluteNewsroomUrl(post.url),
    ...post.dateParts,
  }));
  return new Response(JSON.stringify({ status: 200, data }), { headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow' } });
}
