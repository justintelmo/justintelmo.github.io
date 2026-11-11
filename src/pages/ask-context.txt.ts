import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { skillGroups } from '../data/skills';
import { buildAskContext } from '../lib/askContext';

// Built to dist/ask-context.txt. The chat Worker fetches it, so the site stays the one source of truth.
export const GET: APIRoute = async () => {
  const [jobs, games] = await Promise.all([getCollection('jobs'), getCollection('games')]);
  return new Response(buildAskContext({ jobs, games, skillGroups }), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
