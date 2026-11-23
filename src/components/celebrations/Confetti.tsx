import { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { mulberry32 } from '@/domain/shared/rng';
import { useMotion, useTheme } from '@/theme';

interface Particle {
  x: number;
  drift: number;
  delay: number;
  size: number;
  spin: number;
  color: string;
}

/**
 * Confetti in red, purple and gold (R3.2). Falls once at a moderate speed and fades out: no loop,
 * no strobing. The count comes from `useMotion()` (fewer in calm, none in none). It sits in the
 * decoration layer, behind the text, and never takes touches.
 */
export function Confetti({ seed = 1 }: { seed?: number }) {
  const motion = useMotion();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const count = motion.count('confettiCount');
  const particles = useMemo<Particle[]>(() => {
    const rnd = mulberry32(seed);
    const palette = [
      theme.colors.magenta,
      theme.colors.purple,
      theme.colors.gold,
      theme.colors.goldHighlight,
    ];
    return Array.from({ length: count }, () => ({
      x: rnd() * width,
      drift: (rnd() - 0.5) * 80,
      delay: rnd() * 600,
      size: 6 + rnd() * 6,
      spin: (rnd() - 0.5) * 540,
      color: palette[Math.floor(rnd() * palette.length)],
    }));
  }, [count, seed, theme.colors, width]);

  const progress = useSharedValue(0);
  const duration = motion.duration('celebrate') * 1.5;
  useEffect(() => {
    progress.value = 0;
    if (count > 0)
      progress.value = withDelay(100, withTiming(1, { duration, easing: Easing.linear }));
  }, [count, duration, progress]);

  if (count === 0) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {particles.map((p, i) => (
        <Piece key={i} particle={p} progress={progress} totalMs={duration} />
      ))}
    </View>
  );
}

function Piece({
  particle,
  progress,
  totalMs,
}: {
  particle: Particle;
  progress: SharedValue<number>;
  totalMs: number;
}) {
  const { height } = useWindowDimensions();
  const startShare = particle.delay / totalMs;
  const style = useAnimatedStyle(() => {
    const t = Math.min(1, Math.max(0, (progress.value - startShare) / (1 - startShare)));
    return {
      opacity: t <= 0 ? 0 : 1 - t * t,
      transform: [
        { translateX: particle.x + particle.drift * t },
        { translateY: -20 + t * height * 0.9 },
        { rotate: `${particle.spin * t}deg` },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        styles.piece,
        { width: particle.size, height: particle.size * 0.6, backgroundColor: particle.color },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  piece: { position: 'absolute', top: 0, left: 0, borderRadius: 2 },
});
