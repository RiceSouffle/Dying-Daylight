import {
  formatDate,
  formatDateDisplay,
  getDayOfYear,
  getTodayDateString,
  getTomorrowDateString,
} from '../lib/date';

describe('formatDate', () => {
  it('zero-pads month and day', () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(formatDate(new Date(2026, 6, 15))).toBe('2026-07-15');
    expect(formatDate(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('formatDateDisplay', () => {
  it('renders a human-readable US date', () => {
    expect(formatDateDisplay('2026-07-15')).toBe('July 15, 2026');
    expect(formatDateDisplay('2026-01-01')).toBe('January 1, 2026');
  });
});

describe('getDayOfYear', () => {
  it('counts Jan 1 as day 1', () => {
    expect(getDayOfYear(new Date(2026, 0, 1))).toBe(1);
  });

  it('handles a non-leap year end', () => {
    expect(getDayOfYear(new Date(2026, 11, 31))).toBe(365);
  });

  it('handles a leap year end', () => {
    expect(getDayOfYear(new Date(2024, 11, 31))).toBe(366);
  });
});

describe('today / tomorrow', () => {
  it('tomorrow is the day after today', () => {
    const today = getTodayDateString();
    const tomorrow = getTomorrowDateString();
    expect(tomorrow > today).toBe(true);
    // Both are valid YYYY-MM-DD strings.
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(tomorrow).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
