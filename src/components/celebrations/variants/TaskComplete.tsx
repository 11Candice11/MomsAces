import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import type { TaskId } from '@/domain/tasks/definitions';
import type { ScreenRect } from '@/store';
import { strings } from '@/strings';
import { useMotion, useTheme } from '@/theme';
import { PlayingCard } from '../../cards/PlayingCard';
import { Icon } from '../../Icon';
import { Mascot, useDisplayName } from '../../mascot';
import { RewardRow } from '../../RewardChip';
import { TASK_ICONS, taskStrings } from '../../taskIcons';
import { CelebrationOverlay } from '../CelebrationOverlay';
import { Confetti } from '../Confetti';
import { FlyingReward } from '../FlyingReward';

const CARD_WIDTH = 200;

interface TaskCompleteProps {
  taskId: TaskId;
  tickets: number;
  stars: number;
  headline?: 'taskCompleted' | 'sessionComplete';
  onCollect: () => void;
}

/**
 * Task complete (R3.2, design section 9): the task card flips into a golden Ace, confetti falls
 * behind the text, and the ticket and stars fly to their counters. In calm the flip becomes a
 * crossfade with one soft scale; in none the golden Ace is shown at once (static end state).
 */
export function TaskComplete({
  taskId,
  tickets,
  stars,
  headline = 'taskCompleted',
  onCollect,
}: TaskCompleteProps) {
  const theme = useTheme();
  const motion = useMotion();
  const name = useDisplayName();
  const task = taskStrings(taskId);
  const flip = useSharedValue(motion.level === 'none' ? 1 : 0);
  const cardRef = useRef<View>(null);
  const [cardRect, setCardRect] = useState<ScreenRect | null>(null);

  useEffect(() => {
    if (motion.level === 'none') return;
    const [x1, y1, x2, y2] = motion.easing('gentle');
    flip.value = withDelay(
      motion.duration('fast'),
      withTiming(1, { duration: motion.duration('slow'), easing: Easing.bezier(x1, y1, x2, y2) }),
    );
  }, [flip, motion]);

  const flipping = motion.level === 'full';
  const frontStyle = useAnimatedStyle(() =>
    flipping
      ? {
          opacity: flip.value < 0.5 ? 1 : 0,
          transform: [{ perspective: 800 }, { rotateY: `${flip.value * 180}deg` }],
        }
      : { opacity: 1 - flip.value },
  );
  const backStyle = useAnimatedStyle(() =>
    flipping
      ? {
          opacity: flip.value < 0.5 ? 0 : 1,
          transform: [{ perspective: 800 }, { rotateY: `${flip.value * 180 - 180}deg` }],
        }
      : { opacity: flip.value, transform: [{ scale: 0.96 + 0.04 * flip.value }] },
  );

  const iconCircle = (background: string, color: string) => (
    <View
      style={[styles.iconCircle, { backgroundColor: background, borderColor: theme.colors.gold }]}
    >
      <Icon name={TASK_ICONS[taskId]} size={48} color={color} />
    </View>
  );

  return (
    <CelebrationOverlay
      kicker={
        headline === 'sessionComplete'
          ? strings.celebrations.sessionComplete
          : strings.celebrations.taskCompleted
      }
      title={strings.celebrations.magnificent}
      decoration={<Confetti seed={taskId.length * 7919} />}
      foreground={
        <>
          {tickets > 0 ? (
            <FlyingReward kind="tickets" from={cardRect} delayMs={motion.duration('slow') + 300} />
          ) : null}
          {stars > 0 ? (
            <FlyingReward kind="stars" from={cardRect} delayMs={motion.duration('slow') + 500} />
          ) : null}
        </>
      }
      buttonLabel={strings.common.collect}
      onCollect={onCollect}
    >
      <View
        ref={cardRef}
        onLayout={() =>
          cardRef.current?.measureInWindow((x, y, width, height) =>
            setCardRect({ x, y, width, height }),
          )
        }
        accessible
        accessibilityLabel={strings.celebrations.aceCardLabel(task.short)}
        style={{ width: CARD_WIDTH, height: CARD_WIDTH * 1.4 }}
      >
        <Animated.View style={[StyleSheet.absoluteFill, frontStyle]}>
          <PlayingCard width={CARD_WIDTH}>
            {iconCircle(theme.colors.velvetRaised, theme.colors.goldHighlight)}
          </PlayingCard>
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, backStyle]}>
          <PlayingCard
            width={CARD_WIDTH}
            face="gold"
            cornerRank="A"
            cornerSuit={'\u2660\uFE0E'}
            borderWidth={4}
          >
            <Icon name="crown" size={28} color={theme.colors.gold} />
            {iconCircle(theme.colors.burgundy, theme.colors.goldHighlight)}
            <View
              style={[
                styles.label,
                { backgroundColor: theme.colors.burgundy, borderRadius: theme.radii.pill },
              ]}
            >
              <Text
                allowFontScaling={false}
                numberOfLines={1}
                style={[
                  styles.labelText,
                  { fontFamily: theme.fonts.bodyBold, color: theme.colors.cream },
                ]}
              >
                {strings.celebrations.aceCardTitle(task.short)}
              </Text>
            </View>
          </PlayingCard>
        </Animated.View>
      </View>
      <RewardRow tickets={tickets} stars={stars} />
      <Mascot pose="cheering" message={strings.mascot.taskComplete(name, task.short)} />
    </CelebrationOverlay>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  label: { paddingHorizontal: 12, paddingVertical: 4 },
  labelText: { fontSize: 14, letterSpacing: 1 },
});
