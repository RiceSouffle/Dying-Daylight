import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Reflection, ReflectionStore, Settings } from './types';
import { DEFAULT_SETTINGS } from './constants';

const REFLECTIONS_KEY = '@dying-daylight/reflections';
const SETTINGS_KEY = '@dying-daylight/settings';
const DEVICE_SEED_KEY = '@dying-daylight/device-seed';

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

export async function getSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return { ...DEFAULT_SETTINGS };
  return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
