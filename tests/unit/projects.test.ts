import { describe, expect, it } from 'vitest';
import {
  archiveYear,
  projectAnchor,
  resolveJobProjects,
  sortArchive,
  sortJobs,
  sortProjects,
} from '../../src/lib/projects';

const project = (id: string, data: { title: string; featured: boolean; order: number; workedFrom: string; launched?: number }) => ({ id, data });

const casino = project('big-fish-casino', { title: 'Big Fish Casino', featured: true, order: 3, workedFrom: '2013-06' });
const bingo = project('big-fish-bingo', { title: 'Big Fish Bingo', featured: false, order: 0, workedFrom: '2013-06', launched: 2014 });
const pirates = project('battle-pirates', { title: 'Battle Pirates', featured: true, order: 2, workedFrom: '2016-03' });
const projects = [casino, bingo, pirates];

const job = (id: string, from: string, projectSlugs: string[]) => ({ id, data: { from, projectSlugs } });

describe('sortProjects', () => {
  it('keeps featured projects only, by order', () => {
    expect(sortProjects(projects).map((p) => p.id)).toEqual(['battle-pirates', 'big-fish-casino']);
  });
});

describe('sortArchive', () => {
  it('lists everything newest first, ties by title', () => {
    expect(sortArchive(projects).map((p) => p.id)).toEqual(['battle-pirates', 'big-fish-bingo', 'big-fish-casino']);
  });

  it('sorts by the year the table shows, not when work started', () => {
    const oldGame = project('old-game', { title: 'Old Game', featured: true, order: 1, workedFrom: '2016-05', launched: 2011 });
    const newGame = project('new-game', { title: 'New Game', featured: true, order: 2, workedFrom: '2014-01', launched: 2013 });
    expect(sortArchive([oldGame, newGame]).map((p) => p.id)).toEqual(['new-game', 'old-game']);
  });
});

describe('archiveYear', () => {
  it('prefers the launch year', () => {
    expect(archiveYear(bingo)).toBe(2014);
  });

  it('falls back to the year work started', () => {
    expect(archiveYear(pirates)).toBe(2016);
  });
});

describe('projectAnchor', () => {
  it('points featured projects at their card', () => {
    expect(projectAnchor(pirates)).toBe('project-battle-pirates');
  });

  it('points other projects at their archive row', () => {
    expect(projectAnchor(bingo)).toBe('archive-big-fish-bingo');
  });
});

describe('sortJobs', () => {
  it('orders jobs oldest first', () => {
    const jobs = [job('kixeye', '2016-03', []), job('big-fish', '2013-06', []), job('glu', '2018-07', [])];
    expect(sortJobs(jobs).map((j) => j.id)).toEqual(['big-fish', 'kixeye', 'glu']);
  });
});

describe('resolveJobProjects', () => {
  it('returns projects in the order the job lists them', () => {
    const bigFish = job('big-fish', '2013-06', ['big-fish-casino', 'big-fish-bingo']);
    expect(resolveJobProjects(bigFish, projects)).toEqual([casino, bingo]);
  });

  it('throws on a slug with no matching project', () => {
    const broken = job('kixeye', '2016-03', ['unknown-slug']);
    expect(() => resolveJobProjects(broken, projects)).toThrow(/kixeye.*unknown-slug/);
  });
});
