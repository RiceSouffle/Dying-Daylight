import { computeLifeStats, weekStateAt, parseISODate, WEEKS_PER_YEAR } from '../lib/life';

describe('parseISODate', () => {
  it('parses to local midnight', () => {
    const d = parseISODate('2026-07-15');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(6);
    expect(d.getDate()).toBe(15);
  });
});

describe('computeLifeStats', () => {
  it('computes weeks and age for a 20-year-old', () => {
    // 2000-01-01 → 2020-01-01 is 7305 days (5 leap days).
    const stats = computeLifeStats('2000-01-01', 80, new Date(2020, 0, 1));
    expect(stats.daysLived).toBe(7305);
    expect(stats.weeksLived).toBe(Math.floor(7305 / 7)); // 1043
    expect(stats.totalWeeks).toBe(80 * WEEKS_PER_YEAR); // 4160
    expect(stats.weeksRemaining).toBe(4160 - 1043);
    expect(stats.ageYears).toBe(20);
    expect(stats.rows).toBe(80);
    expect(stats.columns).toBe(52);
  });

  it('accounts for a birthday that has not occurred yet this year', () => {
    // Born July 15; on Jan 1 the person is still 19.
    const stats = computeLifeStats('2000-07-15', 80, new Date(2020, 0, 1));
    expect(stats.ageYears).toBe(19);
  });

  it('clamps a future birth date to zero', () => {
    const stats = computeLifeStats('2030-01-01', 80, new Date(2020, 0, 1));
    expect(stats.daysLived).toBe(0);
    expect(stats.weeksLived).toBe(0);
    expect(stats.weeksRemaining).toBe(stats.totalWeeks);
    expect(stats.ageYears).toBe(0);
    expect(stats.percentElapsed).toBe(0);
  });

  it('clamps a lifespan already exceeded to full', () => {
    const stats = computeLifeStats('1900-01-01', 80, new Date(2020, 0, 1));
    expect(stats.weeksLived).toBe(stats.totalWeeks);
    expect(stats.weeksRemaining).toBe(0);
    expect(stats.percentElapsed).toBe(100);
  });

  it('reports a percentage between 0 and 100', () => {
    const stats = computeLifeStats('1990-06-01', 80, new Date(2026, 6, 15));
    expect(stats.percentElapsed).toBeGreaterThan(0);
    expect(stats.percentElapsed).toBeLessThan(100);
  });
});

describe('weekStateAt', () => {
  it('classifies past, present, and future weeks', () => {
    expect(weekStateAt(5, 10)).toBe('lived');
    expect(weekStateAt(10, 10)).toBe('current');
    expect(weekStateAt(11, 10)).toBe('future');
  });
});
