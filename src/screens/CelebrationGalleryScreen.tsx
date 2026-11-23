import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, ScreenFrame } from '@/components';
import { ECONOMY } from '@/domain/rewards/economy';
import type { MotionLevel } from '@/domain/shared/motionLevel';
import { celebrate, type CelebrationEvent } from '@/store';
import { strings } from '@/strings';
import { useTheme } from '@/theme';

const LEVELS: { level: MotionLevel; label: string }[] = [
  { level: 'full', label: strings.debug.levelFull },
  { level: 'calm', label: strings.debug.levelCalm },
  { level: 'none', label: strings.debug.levelNone },
];

const SAMPLES: { label: string; event: CelebrationEvent }[] = [
  {
    label: strings.debug.taskComplete,
    event: {
      kind: 'taskComplete',
      taskId: 'water',
      tickets: ECONOMY.taskCard.tickets,
      stars: ECONOMY.taskCard.stars,
    },
  },
  {
    label: strings.debug.sessionComplete,
    event: {
      kind: 'taskComplete',
      taskId: 'stretch',
      tickets: ECONOMY.taskCard.tickets,
      stars: ECONOMY.taskCard.stars,
      headline: 'sessionComplete',
    },
  },
  { label: strings.debug.rankUp, event: { kind: 'rankUp', rank: 'queen', level: 1, rankUp: true } },
  {
    label: strings.debug.levelUp,
    event: { kind: 'rankUp', rank: 'jack', level: 3, rankUp: false },
  },
  {
    label: strings.debug.royalFlush,
    event: {
      kind: 'royalFlush',
      tickets: ECONOMY.royalFlush.tickets,
      stars: ECONOMY.royalFlush.stars,
      mysteryId: 'preview',
    },
  },
  { label: strings.debug.mysteryReveal, event: { kind: 'mysteryReveal', pendingId: 'preview' } },
  { label: strings.debug.win, event: { kind: 'win', stars: ECONOMY.solitaireWin.stars } },
  {
    label: strings.debug.aceMessage,
    event: {
      kind: 'aceMessage',
      message: strings.mascot.alreadyPlayed[0](strings.common.defaultDisplayName),
      pose: 'waving',
    },
  },
  {
    label: strings.debug.aceMessageStar,
    event: {
      kind: 'aceMessage',
      message: strings.mascot.extraWater[0](strings.common.defaultDisplayName),
      pose: 'cheering',
      stars: ECONOMY.extraWater.stars,
    },
  },
];

/**
 * DEBUG ONLY (task 4.6; reachable from Settings in development builds). Previews every celebration
 * in the full, calm and none motion levels. Previews never change saved data.
 */
export function CelebrationGalleryScreen() {
  const theme = useTheme();
  return (
    <ScreenFrame title={strings.debug.galleryTitle} showBack>
      <ScrollView
        contentContainerStyle={{ gap: theme.spacing.lg, paddingBottom: theme.spacing.xl }}
      >
        {SAMPLES.map((sample) => (
          <View key={sample.label} style={{ gap: theme.spacing.sm }}>
            <Text style={theme.text.bodyBold}>{sample.label}</Text>
            <View style={[styles.row, { gap: theme.spacing.sm }]}>
              {LEVELS.map(({ level, label }) => (
                <BigButton
                  key={level}
                  variant="secondary"
                  label={label}
                  style={styles.button}
                  onPress={() => celebrate(sample.event, { motionOverride: level })}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  button: { flex: 1, paddingHorizontal: 4 },
});
