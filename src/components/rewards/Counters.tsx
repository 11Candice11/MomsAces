import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { registerRewardTarget, type RewardTarget } from '@/store';
import { strings } from '@/strings';
import { useTheme } from '@/theme';
import { Icon, type IconName } from '../Icon';

interface PillProps {
  icon: IconName;
  label: string;
  accessibilityLabel: string;
  /** Registers this pill's screen position so rewards can fly to it. */
  target?: RewardTarget;
  /** Changes whenever the screen scrolls, so the position is measured again. */
  measureKey?: number;
  onPress?: () => void;
}

function CounterPill({ icon, label, accessibilityLabel, target, measureKey, onPress }: PillProps) {
  const theme = useTheme();
  const ref = useRef<View>(null);

  const measure = () => {
    if (!target) return;
    ref.current?.measureInWindow((x, y, width, height) => {
      if (width > 0) registerRewardTarget(target, { x, y, width, height });
    });
  };

  useEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measureKey]);
  useEffect(() => () => (target ? registerRewardTarget(target, null) : undefined), [target]);

  const body = (
    <>
      <Icon name={icon} color={theme.colors.goldHighlight} size={theme.fontSizes.body + 4} />
      <Text style={theme.text.bodyBold}>{label}</Text>
      {onPress ? (
        <Icon name="chevron-right" color={theme.colors.gold} size={theme.fontSizes.body} />
      ) : null}
    </>
  );
  const style = [
    styles.pill,
    {
      minHeight: onPress ? theme.touch.min : 52,
      borderColor: theme.colors.purple,
      backgroundColor: theme.colors.velvetRaised,
      borderRadius: theme.radii.pill,
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
    },
  ];

  if (onPress) {
    return (
      <Pressable
        ref={ref}
        onLayout={measure}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        android_ripple={{ color: theme.colors.shadow }}
        style={({ pressed }) => [
          ...style,
          { borderColor: theme.colors.gold, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        {body}
      </Pressable>
    );
  }
  return (
    <View
      ref={ref}
      onLayout={measure}
      accessible
      accessibilityLabel={accessibilityLabel}
      style={style}
    >
      {body}
    </View>
  );
}

export function TicketCounter({ count, measureKey }: { count: number; measureKey?: number }) {
  return (
    <CounterPill
      icon="ticket-confirmation"
      label={strings.common.ticketsLabel(count)}
      accessibilityLabel={strings.home.ticketsCounterLabel(count)}
      target="tickets"
      measureKey={measureKey}
    />
  );
}

export function StarCounter({ count, measureKey }: { count: number; measureKey?: number }) {
  return (
    <CounterPill
      icon="star"
      label={strings.common.starsLabel(count)}
      accessibilityLabel={strings.home.starsCounterLabel(count)}
      target="stars"
      measureKey={measureKey}
    />
  );
}

/** Her rank and level. Tapping it opens The Path (R15.3). */
export function RankBadge({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <CounterPill
      icon="crown"
      label={label}
      accessibilityLabel={strings.home.rankBadgeLabel(label)}
      onPress={onPress}
    />
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexGrow: 1,
  },
});
