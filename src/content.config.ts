import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { jobSchema, gameSchema } from './content/schemas';

const games = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/games' }),
  schema: ({ image }) => gameSchema({ image }),
});

const jobs = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/jobs' }),
  schema: jobSchema,
});

export const collections = { games, jobs };
