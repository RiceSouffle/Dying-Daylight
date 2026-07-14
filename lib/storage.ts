import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Reflection, ReflectionStore, Settings } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { getSecureItem, setSecureItem, deleteSecureItem } from './secureStorage';

const REFLECTIONS_KEY = '@dying-daylight/reflections';
const SETTINGS_KEY = '@dying-daylight/settings';
const DEVICE_SEED_KEY = '@dying-daylight/device-seed';
// SecureStore keys must match [A-Za-z0-9._-] — no '@' or '/'.
const API_KEY_SECURE_KEY = 'dying_daylight_api_key';

export async function getDeviceSeed(): Promise<number> {
  const raw = await AsyncStorage.getItem(DEVICE_SEED_KEY);
  if (raw) return Number(raw);

  // Generate a random seed on first launch, unique to this device
  const seed = Math.floor(Math.random() * 1_000_000);
  await AsyncStorage.setItem(DEVICE_SEED_KEY, String(seed));
  return seed;
}

export async function getAllReflections(): Promise<ReflectionStore> {
  const raw = await AsyncStorage.getItem(REFLECTIONS_KEY);
  if (!raw) return {};
  return JSON.parse(raw) as ReflectionStore;
}

export async function getReflection(date: string): Promise<Reflection | null> {
  const store = await getAllReflections();
  return store[date] ?? null;
}

export async function saveReflection(reflection: Reflection): Promise<void> {
  const store = await getAllReflections();
  store[reflection.date] = reflection;
  await AsyncStorage.setItem(REFLECTIONS_KEY, JSON.stringify(store));
}

export async function setReflectionFavorite(
  date: string,
  favorite: boolean
): Promise<Reflection | null> {
  const store = await getAllReflections();
  const existing = store[date];
  if (!existing) return null;
  const updated: Reflection = { ...existing, favorite };
  store[date] = updated;
  await AsyncStorage.setItem(REFLECTIONS_KEY, JSON.stringify(store));
  return updated;
}

export async function getSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  const stored = raw ? (JSON.parse(raw) as Partial<Settings> & { apiKey?: string }) : {};

  // Migration: earlier versions stored the API key in plaintext inside the
  // settings blob. Move any such key into secure storage, then strip it.
  if (stored.apiKey) {
    await setSecureItem(API_KEY_SECURE_KEY, stored.apiKey);
    delete stored.apiKey;
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(stored));
  }

  const apiKey = (await getSecureItem(API_KEY_SECURE_KEY)) ?? '';
  return { ...DEFAULT_SETTINGS, ...stored, apiKey };
}

export async function saveSettings(settings: Settings): Promise<void> {
  // Keep the API key in secure storage, everything else in AsyncStorage.
  const { apiKey, ...rest } = settings;
  if (apiKey) {
    await setSecureItem(API_KEY_SECURE_KEY, apiKey);
  } else {
    await deleteSecureItem(API_KEY_SECURE_KEY);
  }
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(rest));
}
