import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { strings } from '@/strings';
import { useMotion, useTheme } from '@/theme';
import { POSES, type MascotPose } from './poses';

export type MascotSize = 'small' | 'large';

interface MascotProps {
  pose?: MascotPose;
  /** Ace's line (from strings). Short: about 12 words at most (R14.7). */
  message?: string;
  size?: MascotSize;
}

const IMAGE_SIZE: Record<MascotSize, number> = { small: 88, large: 150 };
/** A very small bob, once per glow period: gentle and never flashing. */
const BOB_DP = 3;

/**
 * Ace, the mascot (design section 10). A gentle idle bob only in full motion; a still pose in
 * calm and none. The speech bubble is read as a single label by screen readers.
 */
export function Mascot({ pose = 'waving', message, size = 'small' }: MascotProps) {
  const theme = useTheme();
  const motion = useMotion();
  const bob = useSharedValue(0);
  const dimension = IMAGE_SIZE[size];

  useEffect(() => {
    if (!motion.loop) {
      cancelAnimation(bob);
      bob.value = 0;
      return;
    }
    const half = motion.glow.periodMs / 2;
    const [x1, y1, x2, y2] = motion.easing('gentle');
    const easing = Easing.bezier(x1, y1, x2, y2);
    bob.value = withRepeat(
      withSequence(
        withTiming(-BOB_DP, { duration: half, easing }),
        withTiming(0, { duration: half, easing }),
      ),
      -1,
    );
    return () => cancelAnimation(bob);
  }, [bob, motion]);

  const bobStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));

  return (
    <View
      style={[styles.row, { gap: theme.spacing.md }]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={message ? `${strings.mascot.name}: ${message}` : strings.mascot.name}
    >
      <Animated.View style={bobStyle}>
        <Image
          source={POSES[pose]}
          style={{ width: dimension, height: dimension }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </Animated.View>
      {message ? (
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: theme.colors.velvetRaised,
              borderColor: theme.colors.purple,
              borderRadius: theme.radii.md,
              padding: theme.spacing.md,
            },
          ]}
        >
          <Text style={theme.text.bodyLarge}>{message}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  bubble: { flex: 1, borderWidth: 1 },
});
