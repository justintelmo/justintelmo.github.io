import { describe, expect, it } from 'vitest';
import { formatDateRange, formatYearMonth, formatYearRange } from '../../src/lib/dates';

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

describe('formatYearRange', () => {
  it('joins the start and end years with an en dash', () => {
    expect(formatYearRange('2018-10', '2022-11')).toBe('2018 – 2022');
  });

  it('shows one year when both fall in the same year', () => {
    expect(formatYearRange('2013-02', '2013-11')).toBe('2013');
  });

  it('shows Present when there is no end', () => {
    expect(formatYearRange('2025-01')).toBe('2025 – Present');
  });
});
