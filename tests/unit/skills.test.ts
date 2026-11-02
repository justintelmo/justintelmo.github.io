import { describe, expect, it } from 'vitest';
import { domainYears, monthIndex, percentOf, skillSpans, skillYears, timelineDomain, usesSkill } from '../../src/lib/skills';

const project = (title: string, tech: string[], workedFrom: string, workedTo?: string) => ({
  data: { title, tech, workedFrom, workedTo },
});

const bingo = project('Bingo', ['PHP', 'MySQL'], '2013-10', '2014-09');
const pirates = project('Pirates', ['PHP', 'Laravel', 'C++'], '2016-05', '2018-07');
const covet = project('Covet', ['PHP', 'Kotlin', 'AWS ECS'], '2018-10', '2022-11');
const projects = [covet, bingo, pirates];

describe('usesSkill', () => {
  it('matches the exact name', () => {
    expect(usesSkill(['PHP', 'MySQL'], 'PHP')).toBe(true);
  });

  it('matches a more specific name built on the skill', () => {
    expect(usesSkill(['AWS ECS'], 'AWS')).toBe(true);
  });

  it('does not match a different name that shares a prefix', () => {
    expect(usesSkill(['JavaScript', 'C#'], 'Java')).toBe(false);
    expect(usesSkill(['C#'], 'C')).toBe(false);
  });
});

describe('timelineDomain', () => {
  it('runs from January of the first year to the January after the last', () => {
    const domain = timelineDomain(projects);
    expect(domain).toEqual({ from: monthIndex('2013-01'), to: monthIndex('2023-01') });
    expect(domainYears(domain)).toEqual([2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022]);
  });
});

describe('skillSpans', () => {
  const domain = { from: monthIndex('2013-01'), to: monthIndex('2023-01') };

  it('gives one span per stretch of projects that used the skill, oldest first', () => {
    expect(skillSpans('PHP', projects, domain).map((s) => s.titles)).toEqual([['Bingo'], ['Pirates'], ['Covet']]);
    expect(skillSpans('Kotlin', projects, domain).map((s) => s.titles)).toEqual([['Covet']]);
  });

  it('joins back-to-back projects into one span', () => {
    const casino = project('Casino', ['PHP'], '2014-10', '2015-09');
    const [span, ...rest] = skillSpans('PHP', [casino, bingo], domain);
    expect(rest).toEqual([]);
    expect(span.titles).toEqual(['Bingo', 'Casino']);
    // Oct 2013 through Sep 2015 is 24 months of a 120-month domain.
    expect(span.width).toBeCloseTo(20);
  });

  it('places each span by its months, counting the last month in full', () => {
    const [span] = skillSpans('MySQL', projects, domain);
    expect(span.left).toBeCloseTo(percentOf(monthIndex('2013-10'), domain));
    // Oct 2013 through Sep 2014 is 12 months of a 120-month domain.
    expect(span.width).toBeCloseTo(10);
  });
});

describe('skillYears', () => {
  it('names the first and last years the skill was used', () => {
    expect(skillYears('PHP', projects)).toBe('2013 – 2022');
    expect(skillYears('Laravel', projects)).toBe('2016 – 2018');
  });

  it('says Present when a project using the skill is ongoing', () => {
    expect(skillYears('Go', [project('Now', ['Go'], '2025-01')])).toBe('2025 – Present');
  });
});
