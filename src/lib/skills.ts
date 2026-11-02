import { formatYearRange } from './dates';

// Typed structurally so these work on collection entries and on plain test fixtures alike.
type UsageProject = { data: { title: string; tech: string[]; workedFrom: string; workedTo?: string } };

export type Domain = { from: number; to: number };
export type Span = { titles: string[]; left: number; width: number };

// A skill matches its exact name or a more specific name built on it, so "AWS" covers "AWS ECS"
// but "Java" doesn't match "JavaScript".
export function usesSkill(tech: string[], skill: string): boolean {
  return tech.some((t) => t === skill || t.startsWith(`${skill} `));
}

// Months counted from year 0, so year-months can be subtracted and scaled.
export function monthIndex(ym: string): number {
  const [year, month] = ym.split('-').map(Number);
  return year * 12 + month - 1;
}

// An open-ended project runs to the month the site was built.
function endMonth(project: UsageProject): number {
  const to = project.data.workedTo ?? new Date().toISOString().slice(0, 7);
  return monthIndex(to) + 1;
}

// Whole years, from January of the earliest start to the January after the latest end.
export function timelineDomain(projects: UsageProject[]): Domain {
  const start = Math.min(...projects.map((p) => monthIndex(p.data.workedFrom)));
  const end = Math.max(...projects.map(endMonth));
  return { from: start - (start % 12), to: Math.ceil(end / 12) * 12 };
}

export function domainYears(domain: Domain): number[] {
  const years: number[] = [];
  for (let month = domain.from; month < domain.to; month += 12) years.push(month / 12);
  return years;
}

export function percentOf(month: number, domain: Domain): number {
  return ((month - domain.from) / (domain.to - domain.from)) * 100;
}

// Spans of time the skill was in use, oldest first, as percentages of the domain. Back-to-back
// projects share one span, so a seam doesn't read as a gap; real gaps between jobs stay visible.
export function skillSpans(skill: string, projects: UsageProject[], domain: Domain): Span[] {
  const runs: { titles: string[]; from: number; to: number }[] = [];
  const used = projects
    .filter((p) => usesSkill(p.data.tech, skill))
    .sort((a, b) => monthIndex(a.data.workedFrom) - monthIndex(b.data.workedFrom));
  for (const p of used) {
    const [from, to] = [monthIndex(p.data.workedFrom), endMonth(p)];
    const last = runs.at(-1);
    if (last && from <= last.to) {
      last.titles.push(p.data.title);
      last.to = Math.max(last.to, to);
    } else {
      runs.push({ titles: [p.data.title], from, to });
    }
  }
  return runs.map((run) => {
    const left = percentOf(run.from, domain);
    return { titles: run.titles, left, width: percentOf(run.to, domain) - left };
  });
}

// First and last years the skill was used, in words. An open-ended project reads "Present".
export function skillYears(skill: string, projects: UsageProject[]): string {
  const used = projects.filter((p) => usesSkill(p.data.tech, skill));
  const from = used.map((p) => p.data.workedFrom).sort()[0];
  const open = used.some((p) => !p.data.workedTo);
  const to = open ? undefined : used.map((p) => p.data.workedTo!).sort().at(-1);
  return formatYearRange(from, to);
}
