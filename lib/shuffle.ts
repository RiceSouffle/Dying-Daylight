// Pure, dependency-free helpers for deterministically ordering the curated
// reflections. Kept free of Expo/React Native imports so the logic can be
// unit-tested in isolation (see __tests__/shuffle.test.ts).
import { getDayOfYear } from './date';

// Seeded pseudo-random number generator (mulberry32). Same seed → same stream.
export function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher-Yates shuffle driven by a seed — the same seed always produces the
// same permutation, so a device sees a stable order across launches.
export function buildShuffledIndices(seed: number, length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  const rng = seededRandom(seed);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

// Maps a calendar date to a position in the shuffled list. The year offset
// keeps the sequence advancing across years instead of repeating annually.
export function curatedPosition(dateString: string, length: number): number {
  const [y, m, d] = dateString.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayOfYear = getDayOfYear(date);
  const yearOffset = y * 7;
  return (dayOfYear + yearOffset) % length;
}
