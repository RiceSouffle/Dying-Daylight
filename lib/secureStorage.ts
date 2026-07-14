import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// expo-secure-store is native-only; lazy-require it so web/SSR bundles don't
// touch the native module.
function getSecureStore() {
  return require('expo-secure-store') as typeof import('expo-secure-store');
}

// SecureStore isn't available on web — fall back to AsyncStorage there. This is
// clearly less secure, but the API key never leaves the device either way.
const WEB_FALLBACK_PREFIX = '@dying-daylight/secure/';

export async function getSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(WEB_FALLBACK_PREFIX + key);
  }
  try {
    return await getSecureStore().getItemAsync(key);
  } catch {
    return null;
  }
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(WEB_FALLBACK_PREFIX + key, value);
    return;
  }
  await getSecureStore().setItemAsync(key, value);
}

export async function deleteSecureItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(WEB_FALLBACK_PREFIX + key);
    return;
  }
  try {
    await getSecureStore().deleteItemAsync(key);
  } catch {
    // Nothing to delete, or unavailable — treat as already gone.
  }
}
