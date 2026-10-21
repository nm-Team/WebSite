import { type CollectionEntry, getCollection } from 'astro:content';

import { inspectMarkdown } from './markdown';
import { articlePath, articleSlug, defaultNewsImage, type NewsroomLocale, newsroomPath, publicationDateParts } from './paths';

const categoryNames = {
  'press-release': { 'zh-CN': '新闻稿', en: 'Press Release' },
  update: { 'zh-CN': '更新', en: 'Update' },
  photos: { 'zh-CN': '图片', en: 'Photos' },
  stories: { 'zh-CN': '瞬间', en: 'Stories' },
  statement: { 'zh-CN': 'nmTeam 声明', en: 'nmTeam Statement' },
};
const tagSlugs: Record<string, string> = {
  'nmTeam Account': 'nmTeam-Account',
  'nmBot NEXT': 'nmBot-NEXT',
  'nmBot Intelligence': 'nmBot-Intelligence',
  'nmBot+': 'nmBot-plus',
};

function createPost(entry: CollectionEntry<'newsroom'>) {
  const data = entry.data;
  if (typeof entry.body !== 'string') throw new Error(`Newsroom article ${entry.id} has no Markdown body`);
  const markdown = inspectMarkdown(entry.body);
  const parts = publicationDateParts(data.date);
  return {
    entry,
    articleId: data.articleId,
    locale: data.locale,
    title: data.title,
    slug: articleSlug(data.articleId, data.date),
    url: articlePath(data.locale, data.articleId, data.date),
    category: { slug: data.category, name: categoryNames[data.category][data.locale], url: newsroomPath(data.locale, `category/${data.category}/`) },
    tags: data.tags.map((tag) => ({
      name: data.locale === 'en' && tag === 'nmFun启程测试' ? 'nmFun Prestart Test' : tag,
      slug: tagSlugs[tag] ?? tag,
      url: newsroomPath(data.locale, `tag/${encodeURIComponent(tagSlugs[tag] ?? tag)}/`),
    })),
    created: Math.floor(data.date.getTime() / 1000),
    dateTime: data.date.toISOString(),
    updatedDateTime: data.updated?.toISOString(),
    dateText: new Intl.DateTimeFormat(data.locale, { dateStyle: 'long', timeZone: 'Asia/Shanghai' }).format(data.date),
    dateParts: parts,
    archiveKey: `${parts.year}/${parts.month}`,
    image: data.cover ?? markdown.image?.url ?? defaultNewsImage,
    imageAlt: data.coverAlt || markdown.image?.alt || data.title,
    author: data.author || 'nmTeam',
    description: data.description || markdown.excerpt,
    excerpt: markdown.excerpt,
    searchText: markdown.text,
  };
}

export type NewsPost = ReturnType<typeof createPost>;
export type NewsTaxonomy = { name: string; slug: string; url: string; count: number };

export async function getAllNewsPosts(): Promise<NewsPost[]> {
  const entries = await getCollection('newsroom');
  const keys = new Set<string>();
  const dates = new Map<string, number>();
  for (const { data } of entries) {
    const key = `${data.locale}/${data.articleId}`;
    if (keys.has(key)) throw new Error(`Duplicate Newsroom translation: ${key}`);
    keys.add(key);
    const previousDate = dates.get(data.articleId);
    if (previousDate !== undefined && previousDate !== data.date.getTime()) throw new Error(`Translations disagree on the publication date: ${data.articleId}`);
    dates.set(data.articleId, data.date.getTime());
  }
  return entries.map(createPost).sort((a, b) => b.created - a.created || a.articleId.localeCompare(b.articleId));
}

export async function getNewsPosts(locale: NewsroomLocale): Promise<NewsPost[]> {
  return (await getAllNewsPosts()).filter((post) => post.locale === locale);
}

export function getCategories(posts: readonly NewsPost[]): NewsTaxonomy[] {
  const values = new Map<string, NewsTaxonomy>();
  for (const { category } of posts) values.set(category.slug, { ...category, count: (values.get(category.slug)?.count ?? 0) + 1 });
  return [...values.values()];
}

export function getTags(posts: readonly NewsPost[]): NewsTaxonomy[] {
  const values = new Map<string, NewsTaxonomy>();
  for (const post of posts) {
    for (const tag of post.tags) values.set(tag.slug, { ...tag, count: (values.get(tag.slug)?.count ?? 0) + 1 });
  }
  return [...values.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getArchives(posts: readonly NewsPost[], locale: NewsroomLocale) {
  return [...new Map(posts.map((post) => [post.archiveKey, {
    key: post.archiveKey,
    label: new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', timeZone: 'Asia/Shanghai' }).format(new Date(post.dateTime)),
    url: newsroomPath(locale, `${post.archiveKey}/`),
  }])).values()];
}
