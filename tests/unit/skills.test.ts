import { describe, expect, it } from 'vitest';
import { skillGroups } from '../../src/data/skills';
import { byYears, formatYears } from '../../src/lib/skills';

describe('byYears', () => {
  it('puts the most years first', () => {
    const skills = [{ name: 'Kotlin', years: 3 }, { name: 'PHP', years: 9 }, { name: 'C#', years: 4 }];
    expect(byYears(skills).map((s) => s.name)).toEqual(['PHP', 'C#', 'Kotlin']);
  });

  it('keeps the listed order between skills with the same years', () => {
    const skills = [{ name: 'Redis', years: 9 }, { name: 'MySQL', years: 9, plus: true }];
    expect(byYears(skills).map((s) => s.name)).toEqual(['Redis', 'MySQL']);
  });

  it('does not change the list it was given', () => {
    const skills = [{ name: 'Kotlin', years: 3 }, { name: 'PHP', years: 9 }];
    byYears(skills);
    expect(skills.map((s) => s.name)).toEqual(['Kotlin', 'PHP']);
  });
});

describe('formatYears', () => {
  it('says years', () => {
    expect(formatYears({ name: 'PHP', years: 9 })).toBe('9 years');
  });

  it('says year for exactly one', () => {
    expect(formatYears({ name: 'Ktor', years: 1 })).toBe('1 year');
  });

  it('adds a plus when the years are a floor', () => {
    expect(formatYears({ name: 'PHP', years: 10, plus: true })).toBe('10+ years');
    expect(formatYears({ name: 'Ktor', years: 1, plus: true })).toBe('1+ years');
  });
});

describe('skillGroups', () => {
  it('gives every skill at least a year', () => {
    for (const skill of skillGroups.flatMap((g) => g.items)) expect(skill.years, skill.name).toBeGreaterThanOrEqual(1);
  });
});
