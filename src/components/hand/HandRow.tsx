import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import type { HandCard } from '@/domain/tasks/hand';
import type { TaskId } from '@/domain/tasks/definitions';
import { strings } from '@/strings';
import { useTheme } from '@/theme';
import { Icon } from '../Icon';
import { TASK_ICONS, taskStrings } from '../taskIcons';

interface HandRowProps {
  cards: HandCard[];
  next: TaskId | null;
  formatDue: (time: string) => string;
  onCardPress: (card: HandCard) => void;
}

/**
 * The 4 small cards beneath the featured card (R1.2). A row of 4 when each card fits its label at
 * the 20sp minimum; otherwise (most phones, and at Large and Extra large text) a 2 x 2 grid, so
 * no label is ever shrunk below 20sp (G5).
 */
export function HandRow({ cards, next, formatDue, onCardPress }: HandRowProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const gap = theme.spacing.sm;
  // Room for "Bathroom" or "11:00 AM" at the current body size, plus padding.
  const minCard = theme.fontSizes.body * 5;
  const columns = width > 0 && (width - gap * 3) / 4 >= minCard ? 4 : 2;
  const cardWidth = width > 0 ? (width - gap * (columns - 1)) / columns : undefined;

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      style={[styles.grid, { gap }]}
    >
      {cards.map((card) => (
        <MiniCard
          key={card.taskId}
          card={card}
          isNext={card.taskId === next}
          dueText={formatDue(card.dueTime)}
          width={cardWidth}
          onPress={() => onCardPress(card)}
        />
      ))}
    </View>
  );
}

function MiniCard({
  card,
  isNext,
  dueText,
  width,
  onPress,
}: {
  card: HandCard;
  isNext: boolean;
  dueText: string;
  width?: number;
  onPress: () => void;
}) {
  const theme = useTheme();
  const task = taskStrings(card.taskId);
  const played = card.state === 'played';
  const label = played
    ? strings.tasks.playedCardLabel(task.short)
    : card.isDue
      ? strings.tasks.dueNowLabel(task.short)
      : strings.tasks.cardLabel(task.short, dueText);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isNext }}
      onPress={onPress}
      android_ripple={{ color: theme.colors.shadow }}
      style={({ pressed }) => [
        styles.mini,
        {
          width,
          minHeight: theme.touch.min * 1.6,
          backgroundColor: played ? theme.colors.burgundy : theme.colors.velvetRaised,
          borderColor: isNext
            ? theme.colors.goldHighlight
            : played
              ? theme.colors.gold
              : theme.colors.purple,
          borderWidth: isNext ? 3 : 1,
          borderRadius: theme.radii.md,
          padding: theme.spacing.sm,
          gap: theme.spacing.xs,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.badge}>
        {played ? (
          <Icon name="check-circle" size={26} color={theme.colors.goldHighlight} />
        ) : (
          <Icon name="clock-outline" size={26} color={theme.colors.disabled} />
        )}
      </View>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: theme.colors.velvet, borderColor: theme.colors.gold },
        ]}
      >
        <Icon name={TASK_ICONS[card.taskId]} size={30} color={theme.colors.goldHighlight} />
      </View>
      <Text style={[theme.text.bodyBold, styles.center]}>{task.short}</Text>
      <Text
        style={[
          theme.text.body,
          styles.center,
          { color: played || card.isDue ? theme.colors.goldHighlight : theme.colors.textOnDark },
        ]}
      >
        {played ? strings.tasks.played : card.isDue ? strings.tasks.dueNow : dueText}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  mini: { alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 6, right: 6 },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { textAlign: 'center' },
});
