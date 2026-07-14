import { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Pressable,
  Animated,
  AccessibilityInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReflections } from '../../hooks/useReflections';
import { ReflectionCard } from '../../components/ReflectionCard';
import { COLORS, FONTS } from '../../lib/constants';
import type { Reflection } from '../../lib/types';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { allReflections, loading, error, retry, toggleFavorite } = useReflections();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList<Reflection>>(null);
  const opacity = useRef(new Animated.Value(0)).current;

  // Fade the reflection in like daylight when it first loads. Skipped when the
  // user prefers reduced motion.
  useEffect(() => {
    if (loading) {
      opacity.setValue(0);
      return;
    }
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled) return;
      if (reduceMotion) {
        opacity.setValue(1);
      } else {
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }).start();
      }
    });
    return () => {
      cancelled = true;
    };
  }, [loading, opacity]);

  const renderItem = useCallback(
    ({ item }: { item: Reflection }) => (
      <ReflectionCard reflection={item} onToggleFavorite={toggleFavorite} />
    ),
    [toggleFavorite]
  );

  const keyExtractor = useCallback((item: Reflection) => item.id, []);

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color={COLORS.white} size="small" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={retry} style={styles.retryButton} accessibilityRole="button">
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  if (allReflections.length === 0) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.emptyTitle}>Dying Daylight</Text>
        <Text style={styles.emptyText}>Your first reflection will appear here.</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { paddingTop: insets.top, opacity }]}>
      <FlatList
        ref={flatListRef}
        data={allReflections}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  centered: {
    flex: 1,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  retryText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.white,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.white,
    marginBottom: 16,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
});
