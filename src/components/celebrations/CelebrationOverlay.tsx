import { useEffect, type ReactNode } from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMotion, useTheme } from '@/theme';
import { BigButton } from '../BigButton';

interface CelebrationOverlayProps {
  /** Small label above the title, for example "Task completed". */
  kicker?: string;
  title: string;
  subtitle?: string;
  /** The decoration layer (confetti, sparkles): drawn BEHIND all text, never takes touches. */
  decoration?: ReactNode;
  /** Floating pieces drawn above everything, such as rewards flying to their counters. */
  foreground?: ReactNode;
  children?: ReactNode;
  /** Usually "Collect"; "OK" for an Ace message. */
  buttonLabel: string;
  onCollect: () => void;
}

/**
 * The shared celebration shell (design section 9): dimmed velvet backdrop, title zone, a content
 * slot and one big button at the usual primary position. Nothing auto-dismisses. The content
 * scrolls if it does not fit (largest text size), so text is never cut off. The Android back
 * button does the same as the big button.
 */
export function CelebrationOverlay({
  kicker,
  title,
  subtitle,
  decoration,
  foreground,
  children,
  buttonLabel,
  onCollect,
}: CelebrationOverlayProps) {
  const theme = useTheme();
  const motion = useMotion();
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue(motion.level === 'none' ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: motion.crossfadeMs });
  }, [motion.crossfadeMs, opacity]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onCollect();
      return true;
    });
    return () => sub.remove();
  }, [onCollect]);

  const fade = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        styles.root,
        { backgroundColor: theme.colors.backdrop },
        fade,
      ]}
      accessibilityViewIsModal
    >
      {decoration ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {decoration}
        </View>
      ) : null}
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + theme.spacing.lg,
            padding: theme.spacing.md,
            gap: theme.spacing.lg,
          },
        ]}
      >
        <View style={styles.textZone}>
          {kicker ? (
            <Text style={[theme.text.bodyBold, { color: theme.colors.gold, letterSpacing: 2 }]}>
              {kicker.toUpperCase()}
            </Text>
          ) : null}
          <Text accessibilityRole="header" style={[theme.text.hero, styles.centerText]}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[theme.text.bodyLarge, styles.centerText]}>{subtitle}</Text>
          ) : null}
        </View>
        {children}
      </ScrollView>
      <View
        style={{
          paddingHorizontal: theme.spacing.md,
          paddingBottom: insets.bottom + theme.spacing.md,
        }}
      >
        <BigButton label={buttonLabel} onPress={onCollect} />
      </View>
      {foreground ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {foreground}
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 100, elevation: 100 },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  textZone: { alignItems: 'center', alignSelf: 'stretch' },
  centerText: { textAlign: 'center' },
});
