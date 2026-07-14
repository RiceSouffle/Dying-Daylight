import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState } from 'react';
import { COLORS, FONTS } from '../lib/constants';
import { formatDateDisplay } from '../lib/date';
import { selectionFeedback } from '../lib/haptics';
import type { Reflection } from '../lib/types';

interface Props {
  reflection: Reflection;
  onToggleFavorite: (date: string) => void;
}

export function ReflectionListItem({ reflection, onToggleFavorite }: Props) {
  const [expanded, setExpanded] = useState(false);
  const favorite = !!reflection.favorite;

  const handleLongPress = () => {
    selectionFeedback();
    onToggleFavorite(reflection.date);
  };

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      onLongPress={handleLongPress}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={`${formatDateDisplay(reflection.date)}. ${reflection.text}${
        favorite ? '. Kept.' : ''
      }`}
      accessibilityHint="Double tap to expand. Touch and hold to keep or unkeep."
    >
      <View style={styles.header}>
        <Text style={styles.date}>{formatDateDisplay(reflection.date)}</Text>
        {favorite && <Text style={styles.kept}>Kept</Text>}
      </View>
      <Text style={styles.text} numberOfLines={expanded ? undefined : 2}>
        {reflection.text}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.darkGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  kept: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.white,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  text: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    lineHeight: 26,
  },
});
