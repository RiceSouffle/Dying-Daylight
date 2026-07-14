export interface Reflection {
  id: string;
  text: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO datetime
  source: 'ai' | 'curated';
  favorite?: boolean;
}

export interface Settings {
  apiKey: string;
  notificationTime: { hour: number; minute: number };
  notificationsEnabled: boolean;
  birthDate: string | null; // YYYY-MM-DD, for the Life view
  lifeExpectancyYears: number;
}

export type ReflectionStore = Record<string, Reflection>;
