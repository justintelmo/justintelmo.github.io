import { describe, expect, it } from 'vitest';
import {
  adjacentProjects,
  heroArt,
  projectAnchor,
  projectPath,
  sortProjects,
  spotlightProjects,
} from '../../src/lib/projects';

type Fixture = { title: string; featured: boolean; order: number; workedFrom: string; launched?: number; nda?: boolean; images?: unknown[] };
const project = (id: string, { nda = false, images = [{}], ...rest }: Fixture) => ({ id, data: { ...rest, nda, images } });

const casino = project('big-fish-casino', { title: 'Big Fish Casino', featured: true, order: 3, workedFrom: '2013-06' });
const bingo = project('big-fish-bingo', { title: 'Big Fish Bingo', featured: false, order: 0, workedFrom: '2013-06', launched: 2014 });
const pirates = project('battle-pirates', { title: 'Battle Pirates', featured: true, order: 2, workedFrom: '2016-03' });
const projects = [casino, bingo, pirates];

const dmp = project('dead-mans-party', { title: "Dead Man's Party", featured: true, order: 1, workedFrom: '2025-03' });
const unreleased = project('tgb-unreleased', { title: 'Unreleased', featured: true, order: 0, workedFrom: '2025-03', nda: true });
const storyloom = project('storyloom', { title: 'StoryLoom', featured: true, order: 2, workedFrom: '2024-01' });
const covet = project('covet-fashion', { title: 'Covet Fashion', featured: true, order: 3, workedFrom: '2019-01' });
const noImage = project('no-image', { title: 'No Image', featured: true, order: 4, workedFrom: '2018-01', images: [] });

describe('sortProjects', () => {
  it('keeps featured projects only, by order', () => {
    expect(sortProjects(projects).map((p) => p.id)).toEqual(['battle-pirates', 'big-fish-casino']);
  });
});

describe('projectAnchor', () => {
  it('points every project at its card', () => {
    expect(projectAnchor(pirates)).toBe('project-battle-pirates');
    expect(projectAnchor(bingo)).toBe('project-big-fish-bingo');
  });
});

describe('projectPath', () => {
  it('points every project at its game page', () => {
    expect(projectPath(pirates)).toBe('/games/battle-pirates/');
  });
});

describe('adjacentProjects', () => {
  const sorted = [pirates, casino, bingo];

  it('returns the games on either side', () => {
    expect(adjacentProjects(sorted, 'big-fish-casino')).toEqual({ previous: pirates, next: bingo });
  });

  it('does not wrap past the first or last game', () => {
    expect(adjacentProjects(sorted, 'battle-pirates')).toEqual({ previous: undefined, next: casino });
    expect(adjacentProjects(sorted, 'big-fish-bingo')).toEqual({ previous: casino, next: undefined });
  });
});

describe('heroArt', () => {
  it('keeps the first four released games with images, in order', () => {
    const ids = heroArt([dmp, unreleased, storyloom, covet, noImage, pirates, casino]).map((p) => p.id);
    expect(ids).toEqual(['dead-mans-party', 'storyloom', 'covet-fashion', 'battle-pirates']);
  });
  it('returns fewer when fewer qualify', () => {
    expect(heroArt([unreleased, dmp]).map((p) => p.id)).toEqual(['dead-mans-party']);
  });
});

describe('spotlightProjects', () => {
  it('keeps every released game with an image, in order', () => {
    expect(spotlightProjects([dmp, unreleased, storyloom, noImage, covet]).map((p) => p.id))
      .toEqual(['dead-mans-party', 'storyloom', 'covet-fashion']);
  });
});
