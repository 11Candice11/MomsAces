import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ConfirmDialog, Icon, ScreenFrame } from '@/components';
import { celebrateCard } from '@/components/celebrations/celebrateCard';
import { AllPlayedCard, FeaturedCard } from '@/components/hand/FeaturedCard';
import { HandProgress } from '@/components/hand/HandProgress';
import { HandRow } from '@/components/hand/HandRow';
import { Mascot, useAceLine } from '@/components/mascot';
import { RankBadge, StarCounter, TicketCounter } from '@/components/rewards/Counters';
import { taskStrings } from '@/components/taskIcons';
import { useNow } from '@/components/useNow';
import { localDateKey } from '@/domain/shared/dates';
import { formatTime } from '@/domain/shared/formatTime';
import type { TaskId } from '@/domain/tasks/definitions';
import { aceMood, handState, type HandCard } from '@/domain/tasks/hand';
import { useDeviceClock } from '@/services/clock';
import {
  celebrate,
  gameActions,
  useProgressStore,
  useRewardsStore,
  useSessionStore,
  useSettingsStore,
  type MascotPose,
} from '@/store';
import type { PlayCardResult } from '@/store/gameActions';
import { strings } from '@/strings';
import { useTheme } from '@/theme';

type NameLines = readonly ((name: string) => string)[];

const NEXT_LINES: Record<TaskId, NameLines> = {
  water: strings.mascot.nextWater,
  bathroom: strings.mascot.nextBathroom,
  stretch: strings.mascot.nextStretch,
  stand: strings.mascot.nextStand,
};

/**
 * Home: Today's Hand (R1, design section 12; layout from .kiro/docs/designs/home.png, spec wins).
 * Top bar, rewards strip, Ace, the featured NEXT card, the 4 small cards, hand progress, and one
 * primary action ("Play card", or "Go to Play" once all 4 are played) at the bottom right.
 */
export function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const now = useNow();
  const clock = useDeviceClock();
  const date = localDateKey(now);

  const today = useProgressStore((s) => s.today);
  const rank = useProgressStore((s) => s.rank);
  const rankLevel = useProgressStore((s) => s.rankLevel);
  const tickets = useRewardsStore((s) => s.aceTickets);
  const stars = useRewardsStore((s) => s.goldStars);
  const reminderTimes = useSettingsStore((s) => s.reminderTimes);
  const focus = useSessionStore((s) => s.homeFocus);

  /** Ace's bubble after "Later" (a warm confirmation), until her next action. */
  const [laterSaid, setLaterSaid] = useState(false);
  const [confirmCard, setConfirmCard] = useState<TaskId | null>(null);
  const [measureKey, setMeasureKey] = useState(0);

  // A new day deals a fresh hand: on focus, and whenever the date changes while Home is open.
  useFocusEffect(useCallback(() => gameActions.ensureToday(), []));
  useEffect(() => gameActions.ensureToday(), [date]);

  const hand = useMemo(
    () => handState(today, reminderTimes, now, focus),
    [today, reminderTimes, now, focus],
  );
  const mood = aceMood(hand, reminderTimes, today.water.date, now);
  const nextCard = hand.cards.find((c) => c.taskId === hand.next) ?? null;
  const fmt = useCallback((time: string) => formatTime(time, clock), [clock]);

  const linePool: NameLines =
    mood === 'allPlayed'
      ? strings.mascot.allCaughtUp
      : laterSaid
        ? strings.mascot.laterConfirmed
        : mood === 'sleeping'
          ? strings.mascot.sleeping
          : focus && focus === hand.next
            ? focus === 'stand'
              ? strings.mascot.inviteStand
              : strings.mascot.inviteStretch
            : hand.next
              ? NEXT_LINES[hand.next]
              : strings.mascot.waiting;
  const line = useAceLine(linePool);
  const pose: MascotPose =
    mood === 'allPlayed' ? 'waving' : mood === 'sleeping' ? 'sleeping' : 'waving';

  const showResult = useCallback(
    (result: PlayCardResult, name: string) => {
      switch (result.kind) {
        case 'played':
          celebrateCard(result.outcome);
          break;
        case 'openFlow':
          // Stand With Help and the Exercise Session are placeholders until tasks 8 and 9.
          navigation.navigate(result.flow === 'stand' ? 'StandWithHelp' : 'ExerciseSession');
          break;
        case 'repeat': {
          const pool =
            result.message === 'waterEnough'
              ? strings.mascot.waterEnough
              : strings.mascot.alreadyPlayed;
          celebrate({ kind: 'aceMessage', message: pool[0](name), pose: 'waving' });
          break;
        }
        case 'extraWater':
        case 'guide':
          // Only from notifications (task 6).
          break;
      }
    },
    [navigation],
  );

  const displayName = useSettingsStore((s) => s.displayName);
  const play = useCallback(
    (taskId: TaskId) => {
      setLaterSaid(false);
      showResult(gameActions.playCard(taskId, 'home'), displayName);
    },
    [displayName, showResult],
  );

  const onPlayCard = () => {
    if (hand.next) play(hand.next);
  };
  const onLater = () => {
    if (!hand.next) return;
    gameActions.snoozeCard(hand.next);
    setLaterSaid(true);
  };
  const onCardPress = (card: HandCard) => {
    if (card.state === 'played') {
      celebrate({
        kind: 'aceMessage',
        message: strings.mascot.alreadyPlayed[0](displayName),
        pose: 'waving',
      });
    } else if (card.taskId === hand.next) {
      play(card.taskId);
    } else {
      setConfirmCard(card.taskId);
    }
  };

  const allPlayed = hand.next === null;
  const rankLabel = strings.ranks.rankLevel(strings.ranks[rank], rankLevel);

  return (
    <ScreenFrame
      title={strings.home.title}
      showSettings
      primaryAction={
        allPlayed
          ? {
              label: strings.home.goToPlay,
              icon: 'cards-playing-spade',
              onPress: () => navigation.navigate('Tabs', { screen: 'Play' }),
            }
          : { label: strings.common.playCard, onPress: onPlayCard }
      }
      secondaryAction={allPlayed ? undefined : { label: strings.common.later, onPress: onLater }}
    >
      <ScrollView
        contentContainerStyle={{ gap: theme.spacing.lg, paddingBottom: theme.spacing.md }}
        onScrollEndDrag={() => setMeasureKey((k) => k + 1)}
        onMomentumScrollEnd={() => setMeasureKey((k) => k + 1)}
      >
        <View style={[styles.strip, { gap: theme.spacing.sm }]}>
          <TicketCounter count={tickets} measureKey={measureKey} />
          <StarCounter count={stars} measureKey={measureKey} />
          <RankBadge label={rankLabel} onPress={() => navigation.navigate('Path')} />
        </View>

        <Mascot pose={pose} message={line} />

        <View style={{ gap: theme.spacing.md }}>
          <View style={[styles.heading, { gap: theme.spacing.sm }]}>
            <Icon
              name="cards-playing-outline"
              size={theme.fontSizes.title}
              color={theme.colors.gold}
            />
            <Text accessibilityRole="header" style={theme.text.title}>
              {strings.home.todaysHand}
            </Text>
          </View>
          <View
            style={[
              styles.handPanel,
              {
                backgroundColor: theme.colors.velvetRaised,
                borderColor: theme.colors.purple,
                borderRadius: theme.radii.lg,
                padding: theme.spacing.md,
                gap: theme.spacing.lg,
              },
            ]}
          >
            {nextCard ? (
              <FeaturedCard
                taskId={nextCard.taskId}
                dueTimeText={fmt(nextCard.dueTime)}
                isDue={nextCard.isDue}
                onPress={onPlayCard}
              />
            ) : (
              <AllPlayedCard />
            )}
            <HandRow
              cards={hand.cards}
              next={hand.next}
              formatDue={fmt}
              onCardPress={onCardPress}
            />
          </View>
        </View>

        <HandProgress played={hand.playedCount} total={hand.cards.length} />
      </ScrollView>

      <ConfirmDialog
        visible={confirmCard !== null}
        question={confirmCard ? strings.tasks.playThisNow(taskStrings(confirmCard).short) : ''}
        confirmLabel={strings.common.yes}
        cancelLabel={strings.common.notYet}
        onCancel={() => setConfirmCard(null)}
        onConfirm={() => {
          const card = confirmCard;
          setConfirmCard(null);
          if (card) play(card);
        }}
      />
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  strip: { flexDirection: 'row', flexWrap: 'wrap' },
  heading: { flexDirection: 'row', alignItems: 'center' },
  handPanel: { borderWidth: 1 },
});
