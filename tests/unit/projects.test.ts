import { describe, expect, it } from 'vitest';
import {
  adjacentProjects,
  projectAnchor,
  projectPath,
  sortProjects,
} from '../../src/lib/projects';

const project = (id: string, data: { title: string; featured: boolean; order: number; workedFrom: string; launched?: number }) => ({ id, data });

const casino = project('big-fish-casino', { title: 'Big Fish Casino', featured: true, order: 3, workedFrom: '2013-06' });
const bingo = project('big-fish-bingo', { title: 'Big Fish Bingo', featured: false, order: 0, workedFrom: '2013-06', launched: 2014 });
const pirates = project('battle-pirates', { title: 'Battle Pirates', featured: true, order: 2, workedFrom: '2016-03' });
const projects = [casino, bingo, pirates];

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
