import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ECONOMY } from '@/domain/rewards/economy';
import type { TaskId } from '@/domain/tasks/definitions';
import { strings } from '@/strings';
import { useMotion, useTheme } from '@/theme';
import { Icon } from '../Icon';
import { RewardChip } from '../RewardChip';
import { TASK_ICONS, taskStrings } from '../taskIcons';

interface FeaturedCardProps {
  taskId: TaskId;
  /** Already formatted for the phone's clock (formatTime). */
  dueTimeText: string;
  isDue: boolean;
  onPress: () => void;
}

/**
 * The NEXT card (R1.3, design section 12): larger than the small cards, with a gold border that is
 * the static form of the glow. The slow glow only runs in full motion. Tapping it = "Play card".
 */
export function FeaturedCard({ taskId, dueTimeText, isDue, onPress }: FeaturedCardProps) {
  const theme = useTheme();
  const task = taskStrings(taskId);
  const statusText = isDue ? strings.tasks.dueNow : strings.tasks.dueAt(dueTimeText);

  return (
    <GlowFrame>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={strings.home.featuredLabel(
          task.name,
          isDue ? strings.tasks.dueNow : strings.tasks.dueAt(dueTimeText),
        )}
        onPress={onPress}
        android_ripple={{ color: theme.colors.shadow }}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: theme.colors.cream,
            borderColor: theme.colors.gold,
            borderRadius: theme.radii.lg,
            padding: theme.spacing.md,
            gap: theme.spacing.md,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <View style={styles.topRow}>
          <View
            style={[
              styles.timeChip,
              {
                backgroundColor: theme.colors.burgundy,
                borderRadius: theme.radii.pill,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.xs,
              },
            ]}
          >
            <Text style={[theme.text.bodyBold, { color: theme.colors.cream }]}>{dueTimeText}</Text>
          </View>
        </View>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: theme.colors.burgundy, borderColor: theme.colors.gold },
          ]}
        >
          <Icon name={TASK_ICONS[taskId]} size={56} color={theme.colors.goldHighlight} />
        </View>
        <Text style={[theme.text.title, styles.center, { color: theme.colors.text }]}>
          {task.name}
        </Text>
        <View
          style={[
            styles.statusBox,
            {
              backgroundColor: theme.colors.velvetRaised,
              borderRadius: theme.radii.md,
              padding: theme.spacing.sm,
              gap: theme.spacing.sm,
            },
          ]}
        >
          {/* Due label and reward chips in one wrapping row: side-by-side when they fit,
              stacked when they don't (for example at Extra Large text). */}
          <View style={[styles.statusRow, { gap: theme.spacing.sm }]}>
            <View style={[styles.statusLeft, { gap: theme.spacing.sm }]}>
              {isDue ? (
                <View style={[styles.dot, { backgroundColor: theme.colors.gold }]} />
              ) : (
                <Icon
                  name="clock-outline"
                  size={theme.fontSizes.body + 2}
                  color={theme.colors.goldHighlight}
                />
              )}
              <Text
                style={[theme.text.bodyBold, { color: theme.colors.goldHighlight, flexShrink: 1 }]}
              >
                {statusText}
              </Text>
            </View>
            <RewardChip kind="tickets" amount={ECONOMY.taskCard.tickets} />
            <RewardChip kind="stars" amount={ECONOMY.taskCard.stars} />
          </View>
        </View>
      </Pressable>
    </GlowFrame>
  );
}

/** The golden Ace "All played today" card (R1.18). */
export function AllPlayedCard() {
  const theme = useTheme();
  return (
    <GlowFrame>
      <View
        accessible
        accessibilityLabel={strings.home.allPlayedLabel}
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.goldHighlight,
            borderColor: theme.colors.gold,
            borderRadius: theme.radii.lg,
            padding: theme.spacing.lg,
            gap: theme.spacing.sm,
          },
        ]}
      >
        <View style={styles.aceRow}>
          <Text
            allowFontScaling={false}
            style={[
              styles.aceIndex,
              { fontFamily: theme.fonts.heading, color: theme.colors.burgundy },
            ]}
          >
            A
          </Text>
          <Icon name="crown" size={40} color={theme.colors.burgundy} />
          <Text
            allowFontScaling={false}
            style={[
              styles.aceIndex,
              { fontFamily: theme.fonts.heading, color: theme.colors.burgundy },
            ]}
          >
            A
          </Text>
        </View>
        <Text style={[theme.text.hero, styles.center, { color: theme.colors.text }]}>
          {strings.home.allPlayedTitle}
        </Text>
        <Text style={[theme.text.bodyLarge, styles.center, { color: theme.colors.text }]}>
          {strings.home.allPlayedBody}
        </Text>
      </View>
    </GlowFrame>
  );
}

/** A soft gold halo that pulses slowly in full motion only (one cycle per 2.4 s, R19). */
function GlowFrame({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const motion = useMotion();
  const glow = useSharedValue(motion.glow.maxOpacity);

  useEffect(() => {
    if (!motion.glow.animated) {
      cancelAnimation(glow);
      glow.value = motion.glow.maxOpacity;
      return;
    }
    const half = motion.glow.periodMs / 2;
    const easing = Easing.inOut(Easing.sin);
    glow.value = withRepeat(
      withSequence(
        withTiming(motion.glow.minOpacity, { duration: half, easing }),
        withTiming(motion.glow.maxOpacity, { duration: half, easing }),
      ),
      -1,
    );
    return () => cancelAnimation(glow);
  }, [glow, motion]);

  const haloStyle = useAnimatedStyle(() => ({ opacity: glow.value }));
  return (
    <View style={{ padding: 6 }}>
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: theme.radii.lg + 6, backgroundColor: theme.colors.gold, opacity: 0.35 },
          haloStyle,
        ]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 3, alignItems: 'stretch' },
  topRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  timeChip: { alignSelf: 'flex-end' },
  iconCircle: {
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { textAlign: 'center' },
  statusBox: { flexDirection: 'column' },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  rewardRow: { flexDirection: 'row', flexWrap: 'wrap' },
  dot: { width: 14, height: 14, borderRadius: 7 },
  aceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aceIndex: { fontSize: 36 },
});
