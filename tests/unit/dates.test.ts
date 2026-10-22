import { describe, expect, it } from 'vitest';
import { formatDateRange, formatYearMonth } from '../../src/lib/dates';

describe('formatYearMonth', () => {
  it('formats a year-month as short month and year', () => {
    expect(formatYearMonth('2016-03')).toBe('Mar 2016');
  });
});

describe('formatDateRange', () => {
  it('joins start and end with an en dash', () => {
    expect(formatDateRange('2016-03', '2018-06')).toBe('Mar 2016 – Jun 2018');
  });

  it('shows Present when there is no end', () => {
    expect(formatDateRange('2025-01')).toBe('Jan 2025 – Present');
  });
});
