import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { PlayerRank } from '@/domain/progression/types';
import { strings } from '@/strings';
import { useMotion, useTheme } from '@/theme';
import { Icon } from '../../Icon';
import { Mascot, useAceLine } from '../../mascot';
import { CelebrationOverlay } from '../CelebrationOverlay';
import { Confetti } from '../Confetti';

/** Rank-up (design section 9): the rank badge grows and shows the new rank and level. */
export function RankUp({
  rank,
  level,
  onCollect,
}: {
  rank: PlayerRank;
  level: number;
  onCollect: () => void;
}) {
  const theme = useTheme();
  const motion = useMotion();
  const line = useAceLine(strings.mascot.rankUp);
  const grow = useSharedValue(motion.level === 'none' ? 1 : 0);

  useEffect(() => {
    if (motion.level === 'none') return;
    const [x1, y1, x2, y2] = motion.easing(motion.level === 'full' ? 'bounceSoft' : 'gentle');
    grow.value = withTiming(1, {
      duration: motion.duration('slow'),
      easing: Easing.bezier(x1, y1, x2, y2),
    });
  }, [grow, motion]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.3 + 0.7 * grow.value,
    transform: [{ scale: 0.7 + 0.3 * grow.value }],
  }));
  const label = strings.celebrations.newRankLevel(strings.ranks[rank], level);

  return (
    <CelebrationOverlay
      title={strings.celebrations.rankUpTitle}
      decoration={<Confetti seed={level * 31 + rank.length} />}
      buttonLabel={strings.common.collect}
      onCollect={onCollect}
    >
      <Animated.View style={style}>
        <View
          accessible
          accessibilityLabel={label}
          style={[
            styles.badge,
            {
              backgroundColor: theme.colors.burgundy,
              borderColor: theme.colors.gold,
              borderRadius: theme.radii.lg,
              padding: theme.spacing.lg,
            },
          ]}
        >
          <Icon name="crown" size={64} color={theme.colors.goldHighlight} />
          <Text style={theme.text.hero}>{label}</Text>
        </View>
      </Animated.View>
      <Mascot pose="cheering" message={line} />
    </CelebrationOverlay>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', borderWidth: 3, minWidth: 220 },
});
