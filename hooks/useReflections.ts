import { useState, useEffect, useCallback } from 'react';
import { getAllReflections, setReflectionFavorite } from '../lib/storage';
import { ensureTodayReflection, prefetchTomorrowReflection } from '../lib/reflections';
import { getTodayDateString } from '../lib/date';
import type { Reflection } from '../lib/types';

export function useReflections() {
  const [todayReflection, setTodayReflection] = useState<Reflection | null>(null);
  const [allReflections, setAllReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadToday = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const reflection = await ensureTodayReflection();
      setTodayReflection(reflection);

      // Load reflections up to today only (exclude prefetched future ones)
      const today = getTodayDateString();
      const store = await getAllReflections();
      const sorted = Object.values(store)
        .filter((r) => r.date <= today)
        .sort((a, b) => b.date.localeCompare(a.date));
      setAllReflections(sorted);

      // Prefetch tomorrow in the background
      prefetchTomorrowReflection().catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load reflection');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  const toggleFavorite = useCallback(async (date: string) => {
    // Read the stored value as the source of truth so the flip is correct even
    // if local state is momentarily stale, then persist and reflect in the UI.
    const store = await getAllReflections();
    const current = store[date];
    if (!current) return;
    const next = !current.favorite;

    await setReflectionFavorite(date, next);
    setAllReflections((prev) =>
      prev.map((r) => (r.date === date ? { ...r, favorite: next } : r))
    );
    setTodayReflection((prev) =>
      prev && prev.date === date ? { ...prev, favorite: next } : prev
    );
  }, []);

  return {
    todayReflection,
    allReflections,
    loading,
    error,
    retry: loadToday,
    toggleFavorite,
  };
}
