import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReflections } from '../../hooks/useReflections';
import { ReflectionListItem } from '../../components/ReflectionListItem';
import { COLORS, FONTS } from '../../lib/constants';
import type { Reflection } from '../../lib/types';
import { useCallback } from 'react';

export default function ArchiveScreen() {
  const { allReflections, loading } = useReflections();
  const insets = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item }: { item: Reflection }) => <ReflectionListItem reflection={item} />,
    []
  );

  const keyExtractor = useCallback((item: Reflection) => item.id, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.header}>Archive</Text>
      {allReflections.length === 0 && !loading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Past reflections will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={allReflections}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  header: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    color: COLORS.white,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  list: {
    paddingBottom: 100,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.gray,
  },
});
