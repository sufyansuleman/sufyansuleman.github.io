import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const detailSchema = z.object({
  slug: z.string(),
  summary: z.string().optional()
});

const makeCollection = (name: string) =>
  defineCollection({
    loader: glob({ pattern: '*.mdx', base: `./src/content/${name}` }),
    schema: detailSchema
  });

const pages = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    updated: z.string().optional()
  })
});

export const collections = {
  tools: makeCollection('tools'),
  courses: makeCollection('courses'),
  datasets: makeCollection('datasets'),
  pages
};
