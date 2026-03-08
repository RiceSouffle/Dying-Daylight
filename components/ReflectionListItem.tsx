import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState } from 'react';
import { COLORS, FONTS } from '../lib/constants';
import { formatDateDisplay } from '../lib/date';
import type { Reflection } from '../lib/types';

interface Props {
  reflection: Reflection;
}

export function ReflectionListItem({ reflection }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable onPress={() => setExpanded(!expanded)} style={styles.container}>
      <Text style={styles.date}>{formatDateDisplay(reflection.date)}</Text>
      <Text
        style={styles.text}
        numberOfLines={expanded ? undefined : 2}
      >
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
  date: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  text: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
    lineHeight: 26,
  },
});
