import { useState, useEffect, useCallback } from 'react';
import { getSettings, saveSettings } from '../lib/storage';
import { DEFAULT_SETTINGS } from '../lib/constants';
import type { Settings } from '../lib/types';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await saveSettings(newSettings);
    return newSettings;
  }, [settings]);

  return { settings, updateSettings, loading };
}
