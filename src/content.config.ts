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

const essays = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/essays' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    date: z.string(),
    updated: z.string().optional(),
    status: z.enum(['draft', 'living', 'final']).default('final'),
    series: z.string().optional(),
    tags: z.array(z.string()).optional()
  })
});

export const collections = {
  tools: makeCollection('tools'),
  courses: makeCollection('courses'),
  datasets: makeCollection('datasets'),
  pages,
  essays
};
