import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';
import { jobSchema, gameSchema } from '../../src/content/schemas';

const schema = gameSchema({ image: () => z.string() });

const validGame = {
  title: 'Battle Pirates',
  studio: 'KIXEYE',
  platforms: ['Facebook', 'Web'],
  role: 'Senior Software Engineer',
  summary: 'Built the live events backend for a long-running naval strategy game.',
  workedFrom: '2016-03',
  workedTo: '2018-06',
  featured: true,
  order: 4,
  stats: [{ value: '1.3M', label: 'monthly players', year: 2011, sourceUrl: 'https://example.com/a' }],
  tech: ['PHP'],
  images: [{ src: 'battle-pirates/1.png', alt: 'A fleet at sea', attribution: 'https://example.com/b' }],
  links: [{ label: 'Wikipedia', url: 'https://example.com/c' }],
};

const withStat = (stat: Record<string, unknown>) => ({ ...validGame, stats: [stat] });
const withImage = (image: Record<string, unknown>) => ({ ...validGame, images: [image] });

describe('gameSchema', () => {
  it('accepts a complete game', () => {
    expect(schema.safeParse(validGame).success).toBe(true);
  });

  it('rejects a stat without a year', () => {
    const { year, ...stat } = validGame.stats[0]!;
    expect(schema.safeParse(withStat(stat)).success).toBe(false);
  });

  it('rejects a stat without a source URL', () => {
    const { sourceUrl, ...stat } = validGame.stats[0]!;
    expect(schema.safeParse(withStat(stat)).success).toBe(false);
  });

  it('rejects an image without alt text', () => {
    const { alt, ...image } = validGame.images[0]!;
    expect(schema.safeParse(withImage(image)).success).toBe(false);
  });

  it('rejects an image without attribution', () => {
    const { attribution, ...image } = validGame.images[0]!;
    expect(schema.safeParse(withImage(image)).success).toBe(false);
  });

  it('rejects a game without a summary', () => {
    const { summary, ...game } = validGame;
    expect(schema.safeParse(game).success).toBe(false);
  });

  it('rejects a summary longer than one line (120 characters)', () => {
    expect(schema.safeParse({ ...validGame, summary: 'x'.repeat(121) }).success).toBe(false);
  });

  it('rejects a month outside 01-12', () => {
    expect(schema.safeParse({ ...validGame, workedFrom: '2016-13' }).success).toBe(false);
  });

  it('rejects a featured, non-NDA game with no images', () => {
    expect(schema.safeParse({ ...validGame, images: [] }).success).toBe(false);
  });

  it('accepts a featured NDA game with no images or links', () => {
    const nda = { ...validGame, nda: true, images: [], links: [] };
    expect(schema.safeParse(nda).success).toBe(true);
  });
});

describe('jobSchema', () => {
  const job = { studio: 'KIXEYE', role: 'Senior Software Engineer', from: '2016-03' };

  it('accepts a job with no end date', () => {
    expect(jobSchema.safeParse(job).success).toBe(true);
  });
});
