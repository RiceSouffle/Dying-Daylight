import type { Settings } from './types';

export const COLORS = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#888888',
  darkGray: '#1A1A1A',
  lightGray: '#E5E5E5',
} as const;

export const FONTS = {
  regular: 'PlayfairDisplay_400Regular',
  bold: 'PlayfairDisplay_700Bold',
  italic: 'PlayfairDisplay_400Regular_Italic',
} as const;

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  notificationTime: { hour: 7, minute: 0 },
  notificationsEnabled: true,
};
