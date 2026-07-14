import { Share } from 'react-native';

// Opens the OS share sheet with the reflection text. The share sheet is itself
// the user's confirmation surface for where the text goes.
export async function shareReflection(text: string): Promise<void> {
  try {
    await Share.share({ message: text });
  } catch {
    // Dismissed by the user, or sharing unavailable — nothing to do.
  }
}
