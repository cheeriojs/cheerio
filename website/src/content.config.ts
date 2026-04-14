import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const docs = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/docs' }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    sidebar_position: z.number().optional(),
    sidebar_label: z.string().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    authors: z.union([z.string(), z.array(z.string())]).optional(),
    tags: z.array(z.string()).optional(),
    date: z.date().optional(),
  }),
});

export const collections = { docs, blog };
