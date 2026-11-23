import { StyleSheet, Text, View } from 'react-native';
import { strings } from '@/strings';
import { useTheme } from '@/theme';
import { Icon } from './Icon';

export type RewardKind = 'tickets' | 'stars';

interface RewardChipProps {
  kind: RewardKind;
  amount: number;
  /** "dark" sits on velvet panels; "light" sits on a cream card face. */
  tone?: 'dark' | 'light';
}

/** "+1 Ace Ticket" or "+5 Stars", with its icon. Amounts always come from ECONOMY. */
export function RewardChip({ kind, amount, tone = 'dark' }: RewardChipProps) {
  const theme = useTheme();
  const label =
    kind === 'tickets'
      ? strings.common.rewardTicketChip(amount)
      : strings.common.rewardStarsChip(amount);
  const onLight = tone === 'light';
  return (
    <View
      accessible
      accessibilityLabel={label}
      style={[
        styles.chip,
        {
          backgroundColor: onLight ? theme.colors.burgundy : theme.colors.velvetRaised,
          borderColor: theme.colors.gold,
          borderRadius: theme.radii.pill,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          gap: theme.spacing.sm,
        },
      ]}
    >
      <Icon
        name={kind === 'tickets' ? 'ticket-confirmation' : 'star'}
        color={theme.colors.goldHighlight}
        size={theme.fontSizes.body + 2}
      />
      <Text style={theme.text.bodyBold}>{label}</Text>
    </View>
  );
}

/**
 * A row of reward chips. At Large and Extra large text the chips stack (R12.9), so the
 * title above always keeps the full width.
 */
export function RewardRow({
  tickets,
  stars,
  tone,
}: {
  tickets?: number;
  stars?: number;
  tone?: 'dark' | 'light';
}) {
  const theme = useTheme();
  const stack = theme.textScale !== 'normal';
  return (
    <View style={[stack ? styles.stack : styles.row, { gap: theme.spacing.sm }]}>
      {tickets ? <RewardChip kind="tickets" amount={tickets} tone={tone} /> : null}
      {stars ? <RewardChip kind="stars" amount={stars} tone={tone} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  stack: { flexDirection: 'column', alignItems: 'center' },
});
