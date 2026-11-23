import { StyleSheet, View } from 'react-native';
import type { MascotPose } from '@/store';
import { strings } from '@/strings';
import { useTheme } from '@/theme';
import { BigButton } from '../../BigButton';
import { Mascot } from '../../mascot';
import { RewardChip } from '../../RewardChip';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * The small Ace message (design section 6): a repeat tap, extra water, or a confirmation.
 * One friendly line, an optional "+1 Star" chip, and a big "OK" at the usual primary position.
 * It never auto-dismisses.
 */
export function AceMessage({
  message,
  pose,
  stars,
  onCollect,
}: {
  message: string;
  pose: MascotPose;
  stars?: number;
  onCollect: () => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[StyleSheet.absoluteFill, styles.root, { backgroundColor: theme.colors.backdrop }]}
      accessibilityViewIsModal
    >
      <View style={styles.spacer} />
      <View
        style={[
          styles.panel,
          {
            backgroundColor: theme.colors.velvetRaised,
            borderColor: theme.colors.gold,
            borderRadius: theme.radii.lg,
            padding: theme.spacing.lg,
            margin: theme.spacing.md,
            marginBottom: insets.bottom + theme.spacing.md,
            gap: theme.spacing.lg,
          },
        ]}
      >
        <Mascot pose={pose} message={message} size="small" />
        {stars ? (
          <View style={styles.center}>
            <RewardChip kind="stars" amount={stars} />
          </View>
        ) : null}
        <BigButton label={strings.common.ok} onPress={onCollect} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 100, elevation: 100 },
  spacer: { flex: 1 },
  panel: { borderWidth: 2 },
  center: { alignItems: 'center' },
});
