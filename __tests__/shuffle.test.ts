import { seededRandom, buildShuffledIndices, curatedPosition } from '../lib/shuffle';

describe('seededRandom', () => {
  it('is deterministic for the same seed', () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    const seqA = [a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it('produces values in [0, 1)', () => {
    const rng = seededRandom(7);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('produces different streams for different seeds', () => {
    expect(seededRandom(1)()).not.toBe(seededRandom(2)());
  });
});

describe('buildShuffledIndices', () => {
  it('is a permutation of [0, length)', () => {
    const indices = buildShuffledIndices(123, 1000);
    expect(indices).toHaveLength(1000);
    const sorted = [...indices].sort((a, b) => a - b);
    expect(sorted).toEqual(Array.from({ length: 1000 }, (_, i) => i));
  });

  it('is stable for the same seed', () => {
    expect(buildShuffledIndices(999, 500)).toEqual(buildShuffledIndices(999, 500));
  });

  it('differs across seeds', () => {
    const a = buildShuffledIndices(1, 1000);
    const b = buildShuffledIndices(2, 1000);
    expect(a).not.toEqual(b);
  });
});

describe('curatedPosition', () => {
  const LENGTH = 1000;

  it('stays within bounds', () => {
    for (let day = 1; day <= 366; day++) {
      const date = `2026-${String(Math.ceil(day / 31)).padStart(2, '0')}-${String(
        ((day - 1) % 28) + 1
      ).padStart(2, '0')}`;
      const pos = curatedPosition(date, LENGTH);
      expect(pos).toBeGreaterThanOrEqual(0);
      expect(pos).toBeLessThan(LENGTH);
    }
  });

  it('is deterministic', () => {
    expect(curatedPosition('2026-07-15', LENGTH)).toBe(curatedPosition('2026-07-15', LENGTH));
  });

  it('advances between consecutive days', () => {
    expect(curatedPosition('2026-07-15', LENGTH)).not.toBe(
      curatedPosition('2026-07-16', LENGTH)
    );
  });
});
