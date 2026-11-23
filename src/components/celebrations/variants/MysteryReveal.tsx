import { Text, View } from 'react-native';
import { strings } from '@/strings';
import { useTheme } from '@/theme';
import { PlayingCard } from '../../cards/PlayingCard';
import { Icon } from '../../Icon';
import { CelebrationOverlay } from '../CelebrationOverlay';

/**
 * PLACEHOLDER (task 4.5): the shimmering card, one-tap reveal and prize display are built in task
 * 10.2. The card stays pending (saved) until then, so nothing is lost.
 */
export function MysteryReveal({ onCollect }: { onCollect: () => void }) {
  const theme = useTheme();
  return (
    <CelebrationOverlay
      title={strings.celebrations.mysteryTitle}
      buttonLabel={strings.common.collect}
      onCollect={onCollect}
    >
      <View accessible accessibilityLabel={strings.celebrations.mysteryHidden}>
        <PlayingCard width={180} face="back">
          <Icon name="help-circle" size={56} color={theme.colors.goldHighlight} />
        </PlayingCard>
      </View>
      <Text style={[theme.text.bodyLarge, { textAlign: 'center' }]}>
        {strings.celebrations.revealComingSoon}
      </Text>
    </CelebrationOverlay>
  );
}
