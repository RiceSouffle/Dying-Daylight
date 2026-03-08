import * as Crypto from 'expo-crypto';
import { generateReflectionText } from './anthropic';
import { getReflection, saveReflection, getSettings, getDeviceSeed } from './storage';
import { getTodayDateString, getTomorrowDateString, getDayOfYear } from './date';
import { scheduleDailyNotification } from './notifications';
import curatedReflections from '../data/curated-reflections';
import type { Reflection } from './types';

// Seeded pseudo-random number generator (mulberry32)
function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher-Yates shuffle with a seed — same seed always produces the same order
function buildShuffledIndices(seed: number, length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  const rng = seededRandom(seed);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

// Cache so we only shuffle once per session
let cachedIndices: number[] | null = null;
let cachedSeed: number | null = null;

async function getCuratedReflection(dateString: string): Promise<string> {
  const seed = await getDeviceSeed();

  if (!cachedIndices || cachedSeed !== seed) {
    cachedIndices = buildShuffledIndices(seed, curatedReflections.length);
    cachedSeed = seed;
  }

  const [y, m, d] = dateString.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayOfYear = getDayOfYear(date);
  const yearOffset = y * 7;
  const position = (dayOfYear + yearOffset) % curatedReflections.length;

  return curatedReflections[cachedIndices[position]];
}

export async function ensureTodayReflection(): Promise<Reflection> {
  const today = getTodayDateString();
  const existing = await getReflection(today);
  if (existing) return existing;

  const settings = await getSettings();

  // Try AI generation first if API key exists
  if (settings.apiKey) {
    try {
      const text = await generateReflectionText(settings.apiKey);
      const reflection: Reflection = {
        id: Crypto.randomUUID(),
        text,
        date: today,
        createdAt: new Date().toISOString(),
        source: 'ai',
      };
      await saveReflection(reflection);
      return reflection;
    } catch {
      // Fall through to curated
    }
  }

  // Fallback to curated reflection
  const text = await getCuratedReflection(today);
  const reflection: Reflection = {
    id: Crypto.randomUUID(),
    text,
    date: today,
    createdAt: new Date().toISOString(),
    source: 'curated',
  };
  await saveReflection(reflection);
  return reflection;
}

export async function prefetchTomorrowReflection(): Promise<void> {
  const tomorrow = getTomorrowDateString();
  const existing = await getReflection(tomorrow);
  if (existing) return;

  const settings = await getSettings();
  let text: string;
  let source: 'ai' | 'curated' = 'curated';

  if (settings.apiKey) {
    try {
      text = await generateReflectionText(settings.apiKey);
      source = 'ai';
    } catch {
      text = await getCuratedReflection(tomorrow);
    }
  } else {
    text = await getCuratedReflection(tomorrow);
  }

  const reflection: Reflection = {
    id: Crypto.randomUUID(),
    text,
    date: tomorrow,
    createdAt: new Date().toISOString(),
    source,
  };
  await saveReflection(reflection);

  // Update the scheduled notification with the actual reflection text
  if (settings.notificationsEnabled) {
    await scheduleDailyNotification(text, settings);
  }
}
