import { StyleSheet, Text, View } from 'react-native';
import { strings } from '@/strings';
import { useTheme } from '@/theme';
import { Icon } from '../Icon';

/**
 * "X of 4 cards played", a progress bar, and the closed Royal Flush chest (R1.9). The chest shows
 * only a "?" and its label gives no hint of what is inside (R16.2).
 */
export function HandProgress({ played, total }: { played: number; total: number }) {
  const theme = useTheme();
  const share = total > 0 ? Math.min(1, played / total) : 0;
  const stacked = theme.textScale !== 'normal';
  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: theme.colors.velvetRaised,
          borderColor: theme.colors.purple,
          borderRadius: theme.radii.md,
          padding: theme.spacing.md,
          gap: theme.spacing.sm,
        },
      ]}
    >
      <View style={[stacked ? styles.stack : styles.row, { gap: theme.spacing.xs }]}>
        <Text style={theme.text.bodyBold}>{strings.home.handProgress}</Text>
        <Text style={[theme.text.bodyBold, { color: theme.colors.goldHighlight }]}>
          {strings.home.cardsPlayed(played, total)}
        </Text>
      </View>
      <View style={[styles.row, { gap: theme.spacing.md }]}>
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={strings.home.cardsPlayed(played, total)}
          accessibilityValue={{ min: 0, max: total, now: played }}
          style={[
            styles.track,
            {
              backgroundColor: theme.colors.velvet,
              borderColor: theme.colors.purple,
              borderRadius: theme.radii.pill,
            },
          ]}
        >
          <View
            style={[
              styles.fill,
              {
                width: `${share * 100}%`,
                backgroundColor: theme.colors.gold,
                borderRadius: theme.radii.pill,
              },
            ]}
          />
        </View>
        <View
          accessible
          accessibilityLabel={strings.home.royalFlushChestLabel}
          style={[
            styles.chest,
            {
              borderColor: theme.colors.gold,
              backgroundColor: theme.colors.burgundy,
              borderRadius: theme.radii.pill,
              paddingHorizontal: theme.spacing.md,
              gap: theme.spacing.xs,
            },
          ]}
        >
          <Icon name="treasure-chest" size={26} color={theme.colors.goldHighlight} />
          <Text style={[theme.text.bodyBold, { color: theme.colors.goldHighlight }]}>?</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { borderWidth: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stack: { flexDirection: 'column' },
  track: { flex: 1, height: 18, borderWidth: 1, overflow: 'hidden' },
  fill: { height: '100%' },
  chest: { flexDirection: 'row', alignItems: 'center', minHeight: 48, borderWidth: 1 },
});
