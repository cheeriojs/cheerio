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

const string = z.string();
const stringOrStrings = z.union([string, z.array(string)]);

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: string,
    slug: string.optional(),
    authors: stringOrStrings.optional(),
    tags: z.array(string).optional(),
    date: z.date().optional(),
  }),
});

export const collections = { docs, blog };
