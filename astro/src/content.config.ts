import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';

const newsroom = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/newsroom',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    articleId: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/),
    locale: z.enum(['zh-CN', 'en']),
    title: z.string().min(1),
    date: z.coerce.date(),
    category: z.enum(['update', 'press-release', 'photos', 'stories', 'statement']),
    tags: z.array(z.string().min(1)).default([]),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    description: z.string().optional(),
    author: z.string().optional(),
    updated: z.coerce.date().optional(),
  }),
});

export const collections = { newsroom };
