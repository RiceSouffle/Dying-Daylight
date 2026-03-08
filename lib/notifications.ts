import { Platform } from 'react-native';
import type { Settings } from './types';

// expo-notifications crashes during SSR/web, so we lazy-import it
function getNotifications() {
  return require('expo-notifications') as typeof import('expo-notifications');
}

function getDevice() {
  return require('expo-device') as typeof import('expo-device');
}

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const Device = getDevice();
  if (!Device.isDevice) return false;

  const Notifications = getNotifications();
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyNotification(
  body: string,
  settings: Settings
): Promise<void> {
  if (Platform.OS === 'web') return;

  const Notifications = getNotifications();
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!settings.notificationsEnabled) return;

  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily', {
      name: 'Daily Reflections',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Dying Daylight',
      body: body || 'Your daily reflection awaits.',
      sound: true,
      ...(Platform.OS === 'android' ? { channelId: 'daily' } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: settings.notificationTime.hour,
      minute: settings.notificationTime.minute,
    },
  });
}

export function configureNotificationHandler(): void {
  if (Platform.OS === 'web') return;

  const Notifications = getNotifications();
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}
