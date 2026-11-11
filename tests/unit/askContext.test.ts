import { describe, expect, it } from 'vitest';
import { buildAskContext } from '../../src/lib/askContext';

const job = (id: string, studio: string, from: string, to?: string, body = `Body for ${studio}.`) => ({
  id,
  body,
  data: { studio, role: `Role at ${studio}`, from, to },
});

const game = (id: string, title: string, workedFrom: string, extra: Record<string, unknown> = {}) => ({
  id,
  body: `Body for ${title}.`,
  data: {
    title,
    studio: 'Some Studio',
    platforms: ['iOS', 'Android'],
    role: 'Engineer',
    summary: `Summary of ${title}.`,
    workedFrom,
    workedTo: undefined,
    launched: undefined,
    stats: [],
    tech: ['PHP', 'MySQL'],
    nda: false,
    ...extra,
  },
});

const jobs = [
  job('glu', 'EA / Glu Mobile', '2018-10', '2022-11'),
  job('big-fish', 'Big Fish Games', '2013-06', '2016-02'),
  job('game-band', 'The Game Band', '2024-04'),
];

const games = [
  game('covet', 'Covet Fashion', '2019-01', { launched: 2019 }),
  game('casino', 'Big Fish Casino', '2013-06', { stats: [{ value: '1M', label: 'daily players', year: 2015 }] }),
  game('unreleased', 'Unreleased Title', '2024-04', { nda: true }),
];

const skillGroups = [
  { name: 'Languages', items: [{ name: 'PHP', years: 6 }, { name: 'TypeScript', years: 3, plus: true }] },
  { name: 'Data', items: [{ name: 'Redis', years: 1 }] },
];

const input = { jobs, games, skillGroups };

describe('buildAskContext', () => {
  const text = buildAskContext(input);

  it('contains every job, with its role and dates', () => {
    for (const j of jobs) {
      expect(text).toContain(j.data.studio);
      expect(text).toContain(j.data.role);
      expect(text).toContain(j.body);
    }
    expect(text).toContain('Oct 2018 – Nov 2022');
    expect(text).toContain('Apr 2024 – Present');
  });

  it('contains every game, including non-featured ones', () => {
    for (const g of games) {
      expect(text).toContain(g.data.title);
      expect(text).toContain(g.body);
    }
  });

  it('marks each entry with a header that body headings cannot mimic', () => {
    const withHeading = game('h', 'Headed', '2021-01');
    withHeading.body = '## Key features\n\n### A sub heading';
    const out = buildAskContext({ jobs, games: [withHeading], skillGroups });
    expect(out.match(/^\[JOB\] /gm)).toHaveLength(jobs.length);
    expect(out.match(/^\[GAME\] /gm)).toHaveLength(1);
  });

  it('lists jobs and games newest first', () => {
    const at = (s: string) => text.indexOf(s);
    expect(at('The Game Band')).toBeLessThan(at('EA / Glu Mobile'));
    expect(at('EA / Glu Mobile')).toBeLessThan(at('Big Fish Games'));
    expect(at('Unreleased Title')).toBeLessThan(at('Covet Fashion'));
    expect(at('Covet Fashion')).toBeLessThan(at('Big Fish Casino'));
  });

  it('breaks ties on id', () => {
    const a = game('a-game', 'Alpha', '2020-01');
    const b = game('b-game', 'Beta', '2020-01');
    const out = buildAskContext({ jobs, games: [b, a], skillGroups });
    expect(out.indexOf('Alpha')).toBeLessThan(out.indexOf('Beta'));
  });

  it('flags NDA games and prints stats and skills', () => {
    expect(text).toContain('NDA: yes');
    expect(text).toContain('1M daily players (2015)');
    expect(text).toContain('PHP (6 years)');
    expect(text).toContain('TypeScript (3+ years)');
  });

  it('is identical across two builds, whatever order the input arrives in', () => {
    expect(buildAskContext(input)).toBe(text);
    const shuffled = { jobs: [...jobs].reverse(), games: [...games].reverse(), skillGroups };
    expect(buildAskContext(shuffled)).toBe(text);
  });

  it('has no timestamps, no CRLF, and one trailing newline', () => {
    expect(text).not.toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(text).not.toMatch(/\d{2}:\d{2}:\d{2}/);
    expect(text).not.toContain('\r');
    expect(text.endsWith('\n')).toBe(true);
    expect(text.endsWith('\n\n')).toBe(false);
  });

  it('normalizes CRLF in bodies', () => {
    const crlf = buildAskContext({ jobs: [job('x', 'X Co', '2020-01', undefined, 'one\r\ntwo\r\n')], games: [], skillGroups: [] });
    expect(crlf).toContain('one\ntwo');
    expect(crlf).not.toContain('\r');
  });
});
