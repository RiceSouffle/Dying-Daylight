export interface Reflection {
  id: string;
  text: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO datetime
  source: 'ai' | 'curated';
}

export interface Settings {
  apiKey: string;
  notificationTime: { hour: number; minute: number };
  notificationsEnabled: boolean;
}

export type ReflectionStore = Record<string, Reflection>;
