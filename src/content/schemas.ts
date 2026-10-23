import { z } from 'astro/zod';

export const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use YYYY-MM');

export const statSchema = z.object({
  value: z.string(),
  label: z.string(),
  year: z.number().int(),
  sourceUrl: z.url(),
});

const linkSchema = z.object({ label: z.string(), url: z.url() });

export function projectSchema({ image }: { image: () => z.ZodType }) {
  return z
    .object({
      title: z.string(),
      studio: z.string(),
      platforms: z.array(z.string()),
      role: z.string(),
      workedFrom: yearMonth,
      workedTo: yearMonth.optional(),
      launched: z.number().int().optional(),
      featured: z.boolean(),
      order: z.number(),
      contributions: z.array(z.string()),
      stats: z.array(statSchema).default([]),
      tech: z.array(z.string()),
      images: z
        .array(z.object({ src: image(), alt: z.string().min(1), attribution: z.url() }))
        .default([]),
      links: z.array(linkSchema).default([]),
      nda: z.boolean().default(false),
    })
    .refine((p) => !p.featured || p.nda || (p.images.length > 0 && p.links.length > 0), {
      message: 'A featured project needs at least one image and one link, unless it is under NDA',
      path: ['images'],
    });
}

export const jobSchema = z.object({
  studio: z.string(),
  role: z.string(),
  from: yearMonth,
  to: yearMonth.optional(),
  projectSlugs: z.array(z.string()).min(1),
});
