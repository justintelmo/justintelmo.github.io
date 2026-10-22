// Fixed names so output never depends on the build machine's locale or timezone.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatYearMonth(ym: string): string {
  const [year, month] = ym.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

export function formatDateRange(from: string, to?: string): string {
  return `${formatYearMonth(from)} – ${to ? formatYearMonth(to) : 'Present'}`;
}
