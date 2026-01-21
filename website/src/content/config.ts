import { defineCollection, z } from 'astro:content';

const docs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    sidebar_position: z.number().optional(),
    sidebar_label: z.string().optional(),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    authors: z.union([z.string(), z.array(z.string())]).optional(),
    tags: z.array(z.string()).optional(),
    date: z.date().optional(),
  }),
});

export const collections = { docs, blog };
