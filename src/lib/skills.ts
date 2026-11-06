// Years are entered by hand. A plus means "at least", as in 10+ years.
export type Skill = { name: string; years: number; plus?: boolean };

// Most years first. The sort is stable, so ties keep the order they were listed in.
export function byYears<S extends Skill>(skills: S[]): S[] {
  return [...skills].sort((a, b) => b.years - a.years);
}

export function formatYears({ years, plus }: Skill): string {
  return plus ? `${years}+ years` : `${years} ${years === 1 ? 'year' : 'years'}`;
}
