import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { jobSchema, gameSchema } from './content/schemas';

const games = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/games' }),
  schema: ({ image }) => gameSchema({ image }),
});

// Not rendered anywhere yet. Kept as career-history data for a future page.
const jobs = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/jobs' }),
  schema: jobSchema,
});

export const collections = { games, jobs };
