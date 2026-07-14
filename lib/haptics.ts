import { Platform } from 'react-native';

// expo-haptics is a no-op-or-throw on web; lazy-require and guard so callers
// can fire feedback unconditionally.
function getHaptics() {
  return require('expo-haptics') as typeof import('expo-haptics');
}

export function selectionFeedback(): void {
  if (Platform.OS === 'web') return;
  getHaptics()
    .selectionAsync()
    .catch(() => {});
}

export function lightImpact(): void {
  if (Platform.OS === 'web') return;
  const Haptics = getHaptics();
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
