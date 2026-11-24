import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  // _로 시작하는 파일은 글로 취급하지 않습니다.
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1).max(200),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    authors: z.array(reference('authors')).min(1),
    tags: z
      .array(z.string().regex(/^[\p{L}\p{N}.+-]+$/u, '태그에는 글자, 숫자, . + - 만 쓸 수 있습니다'))
      .default([]),
    draft: z.boolean().default(false),
  }),
});

const authors = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/authors' }),
  schema: z.object({
    name: z.string().min(1),
    role: z.string().optional(),
    bio: z.string().optional(),
    github: z.string().optional(),
  }),
});

export const collections = { posts, authors };
