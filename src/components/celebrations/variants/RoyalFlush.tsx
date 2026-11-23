import { StyleSheet, Text, View } from 'react-native';
import { strings } from '@/strings';
import { useTheme } from '@/theme';
import { Icon } from '../../Icon';
import { Mascot, useAceLine } from '../../mascot';
import { RewardRow } from '../../RewardChip';
import { CelebrationOverlay } from '../CelebrationOverlay';
import { Confetti } from '../Confetti';

/**
 * PLACEHOLDER (task 4.5): the full Royal Flush (fanned cards, opening the chest into the mystery
 * reveal) is built in task 10.1. This shows the bonus chips and the closed chest with only a "?".
 * Nothing about the chest's contents is shown or read out (R16.2).
 */
export function RoyalFlush({
  tickets,
  stars,
  onCollect,
}: {
  tickets: number;
  stars: number;
  onCollect: () => void;
}) {
  const theme = useTheme();
  const line = useAceLine(strings.mascot.royalFlush);
  return (
    <CelebrationOverlay
      title={strings.celebrations.royalFlushTitle}
      subtitle={strings.celebrations.royalFlushSubtitle}
      decoration={<Confetti seed={tickets * 101 + stars} />}
      buttonLabel={strings.common.collect}
      onCollect={onCollect}
    >
      <RewardRow tickets={tickets} stars={stars} />
      <View
        accessible
        accessibilityLabel={strings.celebrations.chestHidden}
        style={[
          styles.chest,
          {
            backgroundColor: theme.colors.burgundy,
            borderColor: theme.colors.gold,
            borderRadius: theme.radii.lg,
          },
        ]}
      >
        <Icon name="treasure-chest" size={72} color={theme.colors.goldHighlight} />
        <Text style={theme.text.hero}>?</Text>
      </View>
      <Mascot pose="cheering" message={line} />
    </CelebrationOverlay>
  );
}

const styles = StyleSheet.create({
  chest: { alignItems: 'center', borderWidth: 3, padding: 24, minWidth: 180 },
});
