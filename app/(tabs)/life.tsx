import { memo, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { useSettings } from '../../hooks/useSettings';
import { computeLifeStats, weekStateAt, type WeekState } from '../../lib/life';
import { COLORS, FONTS } from '../../lib/constants';

const { width } = Dimensions.get('window');
const H_PADDING = 24;
const COLUMNS = 52;
const CELL_GAP = 2;
const ROW_GAP = 2;

const GRID_WIDTH = width - H_PADDING * 2;
const CELL = (GRID_WIDTH - CELL_GAP * (COLUMNS - 1)) / COLUMNS;
const ROW_HEIGHT = CELL + ROW_GAP;

function cellColor(state: WeekState): string {
  if (state === 'current') return COLORS.white;
  if (state === 'lived') return COLORS.gray;
  return COLORS.darkGray;
}

const WeekRow = memo(function WeekRow({
  rowIndex,
  weeksLived,
}: {
  rowIndex: number;
  weeksLived: number;
}) {
  const cells = [];
  for (let c = 0; c < COLUMNS; c++) {
    const index = rowIndex * COLUMNS + c;
    const state = weekStateAt(index, weeksLived);
    cells.push(
      <View
        key={c}
        style={[styles.cell, { backgroundColor: cellColor(state) }]}
      />
    );
  }
  return (
    <View
      style={styles.row}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      {cells}
    </View>
  );
});

export default function LifeScreen() {
  const { settings, loading } = useSettings();
  const insets = useSafeAreaInsets();

  const stats = useMemo(() => {
    if (!settings.birthDate) return null;
    return computeLifeStats(settings.birthDate, settings.lifeExpectancyYears, new Date());
  }, [settings.birthDate, settings.lifeExpectancyYears]);

  if (loading) {
    return <View style={[styles.container, { paddingTop: insets.top }]} />;
  }

  if (!stats) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.header}>Life</Text>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            A life, drawn one week at a time.
          </Text>
          <Link href="/settings" style={styles.link}>
            <Text style={styles.linkText}>Set your birth date</Text>
          </Link>
        </View>
      </View>
    );
  }

  const rows = Array.from({ length: stats.rows }, (_, i) => i);
  const summaryLabel = `You have lived approximately ${stats.weeksLived.toLocaleString()} weeks, about ${Math.round(
    stats.percentElapsed
  )} percent of your ${stats.rows} years. Approximately ${stats.weeksRemaining.toLocaleString()} weeks remain.`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.header}>Life</Text>
      <FlatList
        data={rows}
        keyExtractor={(i) => String(i)}
        renderItem={({ item }) => <WeekRow rowIndex={item} weeksLived={stats.weeksLived} />}
        getItemLayout={(_, index) => ({
          length: ROW_HEIGHT,
          offset: ROW_HEIGHT * index,
          index,
        })}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View
            style={styles.summary}
            accessible
            accessibilityLabel={summaryLabel}
          >
            <Text style={styles.bigNumber}>{stats.weeksRemaining.toLocaleString()}</Text>
            <Text style={styles.bigLabel}>weeks remain</Text>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${stats.percentElapsed}%` }]} />
            </View>

            <Text style={styles.caption}>
              {stats.ageYears} years lived · ~{Math.round(stats.percentElapsed)}% of your{' '}
              {stats.rows} years
            </Text>

            <View style={styles.legend}>
              <LegendDot color={COLORS.gray} label="Lived" />
              <LegendDot color={COLORS.white} label="Now" />
              <LegendDot color={COLORS.darkGray} label="Ahead" />
            </View>
          </View>
        }
      />
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
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
    paddingHorizontal: H_PADDING,
    paddingTop: 16,
    paddingBottom: 12,
  },
  list: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 120,
  },
  summary: {
    paddingTop: 8,
    paddingBottom: 28,
  },
  bigNumber: {
    fontFamily: FONTS.bold,
    fontSize: 56,
    color: COLORS.white,
    lineHeight: 60,
  },
  bigLabel: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
    marginBottom: 24,
  },
  progressTrack: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.darkGray,
    marginBottom: 12,
  },
  progressFill: {
    height: 1,
    backgroundColor: COLORS.white,
  },
  caption: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 20,
  },
  legend: {
    flexDirection: 'row',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
  },
  legendLabel: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.gray,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    gap: CELL_GAP,
    marginBottom: ROW_GAP,
  },
  cell: {
    width: CELL,
    height: CELL,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: 18,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 26,
  },
  link: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  linkText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.white,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
