import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useRewardTargets, type RewardTarget, type ScreenRect } from '@/store';
import { useMotion, useTheme } from '@/theme';
import { Icon } from '../Icon';

const ICON = 40;

/**
 * Flies a ticket or star from `from` (window coordinates) to its counter, read from the
 * `RewardTargets` registry (design section 9). Full motion only: in calm and none the counter just
 * shows the new balance, so nothing here is needed to understand the reward (R3.5).
 */
export function FlyingReward({
  kind,
  from,
  delayMs = 0,
}: {
  kind: RewardTarget;
  from: ScreenRect | null;
  delayMs?: number;
}) {
  const motion = useMotion();
  const theme = useTheme();
  const target = useRewardTargets((s) => s.targets[kind]);
  const t = useSharedValue(0);
  const enabled = motion.level === 'full' && from !== null && target !== undefined;

  useEffect(() => {
    if (!enabled) return;
    const [x1, y1, x2, y2] = motion.easing('standard');
    t.value = 0;
    t.value = withDelay(
      delayMs,
      withTiming(1, {
        duration: motion.duration('slow') * 1.5,
        easing: Easing.bezier(x1, y1, x2, y2),
      }),
    );
  }, [delayMs, enabled, motion, t]);

  const start = from
    ? { x: from.x + from.width / 2 - ICON / 2, y: from.y + from.height / 2 - ICON / 2 }
    : { x: 0, y: 0 };
  const end = target
    ? { x: target.x + target.width / 2 - ICON / 2, y: target.y + target.height / 2 - ICON / 2 }
    : start;
  const style = useAnimatedStyle(() => ({
    opacity: t.value === 0 ? 0 : t.value < 0.9 ? 1 : (1 - t.value) * 10,
    transform: [
      { translateX: start.x + (end.x - start.x) * t.value },
      { translateY: start.y + (end.y - start.y) * t.value },
      { scale: 1 - 0.4 * t.value },
    ],
  }));

  if (!enabled) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.icon, style]}>
      <Icon
        name={kind === 'tickets' ? 'ticket-confirmation' : 'star'}
        size={ICON}
        color={theme.colors.goldHighlight}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  icon: { position: 'absolute', top: 0, left: 0, width: ICON, height: ICON },
});
