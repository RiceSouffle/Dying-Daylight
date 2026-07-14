import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReflections } from '../../hooks/useReflections';
import { ReflectionListItem } from '../../components/ReflectionListItem';
import { COLORS, FONTS } from '../../lib/constants';
import type { Reflection } from '../../lib/types';
import { useCallback, useMemo, useState } from 'react';

type Filter = 'all' | 'kept';

export default function ArchiveScreen() {
  const { allReflections, loading, toggleFavorite } = useReflections();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>('all');

  const data = useMemo(
    () => (filter === 'kept' ? allReflections.filter((r) => r.favorite) : allReflections),
    [allReflections, filter]
  );

  const renderItem = useCallback(
    ({ item }: { item: Reflection }) => (
      <ReflectionListItem reflection={item} onToggleFavorite={toggleFavorite} />
    ),
    [toggleFavorite]
  );

  const keyExtractor = useCallback((item: Reflection) => item.id, []);

  const emptyText =
    filter === 'kept'
      ? 'Nothing kept yet. Touch and hold a reflection to keep it.'
      : 'Past reflections will appear here.';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Archive</Text>
        <View style={styles.filters}>
          <FilterTab label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
          <FilterTab label="Kept" active={filter === 'kept'} onPress={() => setFilter('kept')} />
        </View>
      </View>

      {data.length === 0 && !loading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

function FilterTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`Show ${label.toLowerCase()} reflections`}
    >
      <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  header: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    color: COLORS.white,
  },
  filters: {
    flexDirection: 'row',
    gap: 20,
    paddingBottom: 6,
  },
  filterLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  filterLabelActive: {
    color: COLORS.white,
  },
  list: {
    paddingBottom: 100,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
});
