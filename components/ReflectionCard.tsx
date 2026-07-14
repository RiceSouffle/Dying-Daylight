import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { COLORS, FONTS } from '../lib/constants';
import { formatDateDisplay } from '../lib/date';
import { shareReflection } from '../lib/share';
import { selectionFeedback } from '../lib/haptics';
import type { Reflection } from '../lib/types';

const { height } = Dimensions.get('window');

interface Props {
  reflection: Reflection;
  onToggleFavorite: (date: string) => void;
}

export function ReflectionCard({ reflection, onToggleFavorite }: Props) {
  const favorite = !!reflection.favorite;

  const handleKeep = () => {
    selectionFeedback();
    onToggleFavorite(reflection.date);
  };

  const handleShare = () => {
    shareReflection(reflection.text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.date}>{formatDateDisplay(reflection.date)}</Text>

      <View style={styles.textContainer}>
        <Text style={styles.text} accessibilityRole="text">
          {reflection.text}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={handleKeep}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityState={{ selected: favorite }}
          accessibilityLabel={favorite ? 'Kept' : 'Keep this reflection'}
          accessibilityHint="Marks this reflection so you can find it under Kept in the Archive"
        >
          <Text style={[styles.actionLabel, favorite && styles.actionLabelActive]}>
            {favorite ? 'Kept' : 'Keep'}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleShare}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Share this reflection"
        >
          <Text style={styles.actionLabel}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    height: height,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  date: {
    position: 'absolute',
    top: 100,
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.gray,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  textContainer: {
    paddingHorizontal: 8,
  },
  text: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.white,
    lineHeight: 36,
    textAlign: 'center',
  },
  actions: {
    position: 'absolute',
    bottom: 120,
    flexDirection: 'row',
    gap: 40,
  },
  actionLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  actionLabelActive: {
    color: COLORS.white,
  },
});
