import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONTS } from '../lib/constants';
import { formatDateDisplay } from '../lib/date';
import type { Reflection } from '../lib/types';

const { height } = Dimensions.get('window');

interface Props {
  reflection: Reflection;
}

export function ReflectionCard({ reflection }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.date}>{formatDateDisplay(reflection.date)}</Text>
      <View style={styles.textContainer}>
        <Text style={styles.text}>{reflection.text}</Text>
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
});
