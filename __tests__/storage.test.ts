import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// In-memory SecureStore. __store is exposed so tests can reset it.
jest.mock('expo-secure-store', () => {
  const store: Record<string, string> = {};
  return {
    __store: store,
    getItemAsync: async (k: string) => (k in store ? store[k] : null),
    setItemAsync: async (k: string, v: string) => {
      store[k] = v;
    },
    deleteItemAsync: async (k: string) => {
      delete store[k];
    },
  };
});

import {
  getSettings,
  saveSettings,
  saveReflection,
  getReflection,
  setReflectionFavorite,
  getDeviceSeed,
} from '../lib/storage';
import { DEFAULT_SETTINGS } from '../lib/constants';
import type { Reflection } from '../lib/types';

const SETTINGS_KEY = '@dying-daylight/settings';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SecureStore = require('expo-secure-store');

beforeEach(async () => {
  await AsyncStorage.clear();
  for (const k of Object.keys(SecureStore.__store)) delete SecureStore.__store[k];
});

function makeReflection(overrides: Partial<Reflection> = {}): Reflection {
  return {
    id: 'id-1',
    text: 'A reflection.',
    date: '2026-07-15',
    createdAt: '2026-07-15T07:00:00.000Z',
    source: 'curated',
    ...overrides,
  };
}

describe('settings', () => {
  it('returns defaults when nothing is stored', async () => {
    const settings = await getSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it('round-trips settings and keeps the API key out of the plaintext blob', async () => {
    await saveSettings({
      ...DEFAULT_SETTINGS,
      apiKey: 'sk-ant-secret',
      birthDate: '1990-01-01',
      lifeExpectancyYears: 90,
    });

    const settings = await getSettings();
    expect(settings.apiKey).toBe('sk-ant-secret');
    expect(settings.birthDate).toBe('1990-01-01');
    expect(settings.lifeExpectancyYears).toBe(90);

    const blob = await AsyncStorage.getItem(SETTINGS_KEY);
    expect(blob).not.toContain('sk-ant-secret');
    expect(SecureStore.__store['dying_daylight_api_key']).toBe('sk-ant-secret');
  });

  it('removes the secure key when saved empty', async () => {
    await saveSettings({ ...DEFAULT_SETTINGS, apiKey: 'sk-ant-secret' });
    await saveSettings({ ...DEFAULT_SETTINGS, apiKey: '' });
    expect(SecureStore.__store['dying_daylight_api_key']).toBeUndefined();
    expect((await getSettings()).apiKey).toBe('');
  });

  it('migrates a legacy plaintext API key into secure storage', async () => {
    // Simulate an old settings blob that stored the key inline.
    await AsyncStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ apiKey: 'legacy-key', notificationsEnabled: false })
    );

    const settings = await getSettings();
    expect(settings.apiKey).toBe('legacy-key');
    expect(settings.notificationsEnabled).toBe(false);

    const blob = await AsyncStorage.getItem(SETTINGS_KEY);
    expect(blob).not.toContain('legacy-key');
    expect(SecureStore.__store['dying_daylight_api_key']).toBe('legacy-key');
  });
});

describe('reflections', () => {
  it('saves and retrieves a reflection by date', async () => {
    const reflection = makeReflection();
    await saveReflection(reflection);
    expect(await getReflection('2026-07-15')).toEqual(reflection);
    expect(await getReflection('2026-07-16')).toBeNull();
  });

  it('toggles the favorite flag', async () => {
    await saveReflection(makeReflection());
    const updated = await setReflectionFavorite('2026-07-15', true);
    expect(updated?.favorite).toBe(true);
    expect((await getReflection('2026-07-15'))?.favorite).toBe(true);
  });

  it('returns null when favoriting a missing reflection', async () => {
    expect(await setReflectionFavorite('1999-01-01', true)).toBeNull();
  });
});

describe('device seed', () => {
  it('is stable across calls', async () => {
    const first = await getDeviceSeed();
    const second = await getDeviceSeed();
    expect(typeof first).toBe('number');
    expect(first).toBe(second);
  });
});
