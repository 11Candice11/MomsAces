import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { strings } from '@/strings';
import { useMotion } from '@/theme';
import { Mascot, useAceLine } from '../../mascot';
import { RewardChip } from '../../RewardChip';
import { CelebrationOverlay } from '../CelebrationOverlay';
import { Confetti } from '../Confetti';

/** Solitaire win (design section 9): the stars rise. The stars are already saved (G9). */
export function Win({ stars, onCollect }: { stars: number; onCollect: () => void }) {
  const motion = useMotion();
  const line = useAceLine(strings.mascot.cheer);
  const rise = useSharedValue(motion.level === 'none' ? 1 : 0);
  useEffect(() => {
    if (motion.level !== 'none') rise.value = withTiming(1, { duration: motion.duration('slow') });
  }, [motion, rise]);
  const style = useAnimatedStyle(() => ({
    opacity: rise.value,
    transform: [{ translateY: (1 - rise.value) * 24 }],
  }));

  return (
    <CelebrationOverlay
      title={strings.celebrations.youWon}
      decoration={<Confetti seed={stars * 17} />}
      buttonLabel={strings.common.collect}
      onCollect={onCollect}
    >
      <Animated.View style={style}>
        <RewardChip kind="stars" amount={stars} />
      </Animated.View>
      <Mascot pose="cheering" message={line} />
    </CelebrationOverlay>
  );
}
