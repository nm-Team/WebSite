export interface SearchPost {
  url: string;
  image: string;
  title: string;
  dateTime: string;
  dateText: string;
  category: string;
  text: string;
  tags: string[];
}

export function parseSearchPosts(value: unknown, pathPrefix: string): SearchPost[] {
  if (!Array.isArray(value)) throw new Error('Newsroom search index must be an array');
  return value.map((item: unknown, index) => {
    if (typeof item !== 'object' || item === null) throw new Error(`Invalid Newsroom search entry ${index}`);
    const post = item as Record<string, unknown>;
    const { url, image, title, dateTime, dateText, category, text, tags } = post;
    if (typeof url !== 'string' || !url.startsWith(pathPrefix) || typeof image !== 'string' || typeof title !== 'string' || typeof dateTime !== 'string' || typeof dateText !== 'string' || typeof category !== 'string' || typeof text !== 'string' || !Array.isArray(tags) || !tags.every((tag: unknown) => typeof tag === 'string')) {
      throw new Error(`Invalid Newsroom search entry ${index}`);
    }
    return { url, image, title, dateTime, dateText, category, text, tags };
  });
}

export function searchNewsPosts(posts: readonly SearchPost[], query: string): SearchPost[] {
  const term = query.trim().normalize('NFKC').toLocaleLowerCase();
  if (!term) return [];
  return posts.filter((post) => [post.title, post.text, post.category, ...post.tags].join('\n').normalize('NFKC').toLocaleLowerCase().includes(term));
}
