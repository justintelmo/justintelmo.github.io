import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { jobSchema, projectSchema } from './content/schemas';

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: ({ image }) => projectSchema({ image }),
});

const jobs = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/jobs' }),
  schema: jobSchema,
});

export const collections = { projects, jobs };
