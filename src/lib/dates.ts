// Fixed names so output never depends on the build machine's locale or timezone.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatYearMonth(ym: string): string {
  const [year, month] = ym.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

export function formatDateRange(from: string, to?: string): string {
  return `${formatYearMonth(from)} – ${to ? formatYearMonth(to) : 'Present'}`;
}

// Years only, for places with no room for months. One year when the work started and ended in it.
export function formatYearRange(from: string, to?: string): string {
  const [start, end] = [from.slice(0, 4), to ? to.slice(0, 4) : 'Present'];
  return start === end ? start : `${start} – ${end}`;
}
