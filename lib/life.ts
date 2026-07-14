// Pure math for the "Life in Weeks" view — a memento mori laid out as a grid
// of weeks, one row per year of an expected lifespan. No Expo/RN imports, so
// it is unit-tested directly (see __tests__/life.test.ts).

export const WEEKS_PER_YEAR = 52;
const DAY_MS = 1000 * 60 * 60 * 24;

// Exact calendar age in whole years (accounts for whether the birthday has
// occurred yet this year), never negative.
function calendarAge(birth: Date, now: Date): number {
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return Math.max(0, age);
}

export interface LifeStats {
  /** Whole days between birth and `now` (never negative). */
  daysLived: number;
  /** Completed weeks lived, clamped to [0, totalWeeks]. */
  weeksLived: number;
  /** lifeExpectancyYears × 52. */
  totalWeeks: number;
  /** Weeks left in the expected lifespan (never negative). */
  weeksRemaining: number;
  /** Share of the expected lifespan already lived, 0–100. */
  percentElapsed: number;
  /** Whole years of age. */
  ageYears: number;
  /** Grid width — always 52. */
  columns: number;
  /** Grid height — one row per expected year of life. */
  rows: number;
}

// Parse a 'YYYY-MM-DD' string as a local-midnight Date, avoiding the timezone
// drift that `new Date('YYYY-MM-DD')` (UTC) introduces.
export function parseISODate(dateString: string): Date {
  const [y, m, d] = dateString.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function computeLifeStats(
  birthDate: string,
  lifeExpectancyYears: number,
  now: Date
): LifeStats {
  const rows = Math.max(1, Math.round(lifeExpectancyYears));
  const totalWeeks = rows * WEEKS_PER_YEAR;

  const birth = parseISODate(birthDate);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysLived = Math.max(0, Math.floor((startOfToday.getTime() - birth.getTime()) / DAY_MS));

  const weeksLived = Math.min(totalWeeks, Math.floor(daysLived / 7));
  const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
  const percentElapsed = totalWeeks === 0 ? 0 : Math.min(100, (weeksLived / totalWeeks) * 100);
  const ageYears = calendarAge(birth, now);

  return {
    daysLived,
    weeksLived,
    totalWeeks,
    weeksRemaining,
    percentElapsed,
    ageYears,
    columns: WEEKS_PER_YEAR,
    rows,
  };
}

export type WeekState = 'lived' | 'current' | 'future';

// State of a single week cell, given how many weeks have been lived.
export function weekStateAt(index: number, weeksLived: number): WeekState {
  if (index < weeksLived) return 'lived';
  if (index === weeksLived) return 'current';
  return 'future';
}
