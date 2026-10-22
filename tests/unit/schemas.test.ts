import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';
import { jobSchema, projectSchema } from '../../src/content/schemas';

const schema = projectSchema({ image: () => z.string() });

const validProject = {
  title: 'Battle Pirates',
  studio: 'KIXEYE',
  platforms: ['Facebook', 'Web'],
  role: 'Senior Software Engineer',
  workedFrom: '2016-03',
  workedTo: '2018-06',
  featured: true,
  order: 4,
  contributions: ['Built the live events backend'],
  stats: [{ value: '1.3M', label: 'monthly players', year: 2011, sourceUrl: 'https://example.com/a' }],
  tech: ['PHP'],
  images: [{ src: 'battle-pirates/1.png', alt: 'A fleet at sea', attribution: 'https://example.com/b' }],
  links: [{ label: 'Wikipedia', url: 'https://example.com/c' }],
};

const withStat = (stat: Record<string, unknown>) => ({ ...validProject, stats: [stat] });
const withImage = (image: Record<string, unknown>) => ({ ...validProject, images: [image] });

describe('projectSchema', () => {
  it('accepts a complete project', () => {
    expect(schema.safeParse(validProject).success).toBe(true);
  });

  it('rejects a stat without a year', () => {
    const { year, ...stat } = validProject.stats[0]!;
    expect(schema.safeParse(withStat(stat)).success).toBe(false);
  });

  it('rejects a stat without a source URL', () => {
    const { sourceUrl, ...stat } = validProject.stats[0]!;
    expect(schema.safeParse(withStat(stat)).success).toBe(false);
  });

  it('rejects an image without alt text', () => {
    const { alt, ...image } = validProject.images[0]!;
    expect(schema.safeParse(withImage(image)).success).toBe(false);
  });

  it('rejects an image without attribution', () => {
    const { attribution, ...image } = validProject.images[0]!;
    expect(schema.safeParse(withImage(image)).success).toBe(false);
  });

  it('rejects a month outside 01-12', () => {
    expect(schema.safeParse({ ...validProject, workedFrom: '2016-13' }).success).toBe(false);
  });

  it('rejects a featured, non-NDA project with no images', () => {
    expect(schema.safeParse({ ...validProject, images: [] }).success).toBe(false);
  });

  it('accepts a featured NDA project with no images or links', () => {
    const nda = { ...validProject, nda: true, images: [], links: [] };
    expect(schema.safeParse(nda).success).toBe(true);
  });
});

describe('jobSchema', () => {
  const job = { studio: 'KIXEYE', role: 'Senior Software Engineer', from: '2016-03', projectSlugs: ['battle-pirates'] };

  it('accepts a job with no end date', () => {
    expect(jobSchema.safeParse(job).success).toBe(true);
  });

  it('rejects a job with no projects', () => {
    expect(jobSchema.safeParse({ ...job, projectSlugs: [] }).success).toBe(false);
  });
});
