import { ECONOMY } from '@/domain/rewards/economy';
import { atLocalTime } from '@/domain/shared/dates';
import { STORE_KEYS } from '@/services/storageKeys';
import { __mmkvData } from '@/test/mmkvMock';
import {
  awardWin,
  completeFlowCard,
  ensureToday,
  equipCollectionItem,
  markRoyalFlushSeen,
  playCard,
  revealMystery,
  snoozeCard,
  spendGameTicket,
  unlockCollectionItem,
} from '../gameActions';
import { useProgressStore } from '../progressStore';
import { useRewardsStore } from '../rewardsStore';
import { defaultProgress, defaultRewards } from '../sanitize';
import { useSessionStore } from '../sessionStore';

const DATE = '2026-11-23';
const at = (time: string) => atLocalTime(DATE, time);

/** What is actually saved on the device for a store. */
const saved = (key: string) => JSON.parse(__mmkvData().get(key) as string).state;

beforeEach(() => {
  useProgressStore.setState(defaultProgress(DATE));
  useRewardsStore.setState(defaultRewards());
  useSessionStore.setState({ homeFocus: null });
});

describe('playCard', () => {
  it('plays Water and saves the reward before returning (G9)', () => {
    const result = playCard('water', 'home', at('09:05'));
    expect(result.kind).toBe('played');
    expect(saved(STORE_KEYS.rewards)).toMatchObject({
      aceTickets: ECONOMY.taskCard.tickets,
      goldStars: ECONOMY.taskCard.stars,
    });
    expect(saved(STORE_KEYS.progress).today.water.status).toBe('done');
  });

  it('answers a repeat with a message and no reward', () => {
    playCard('water', 'home', at('09:05'));
    expect(playCard('water', 'home', at('09:06'))).toEqual({
      kind: 'repeat',
      taskId: 'water',
      message: 'alreadyPlayed',
    });
    expect(useRewardsStore.getState().aceTickets).toBe(ECONOMY.taskCard.tickets);
  });

  it('opens the flow for Stretch and Stand from Home without playing them', () => {
    expect(playCard('stand', 'home', at('15:00'))).toEqual({
      kind: 'openFlow',
      taskId: 'stand',
      flow: 'stand',
    });
    expect(useProgressStore.getState().today.stand.status).toBe('pending');
  });

  it('sets the focus card from a Start notification, and clears it on play', () => {
    expect(playCard('stretch', 'notification', at('10:00')).kind).toBe('guide');
    expect(useSessionStore.getState().homeFocus).toBe('stretch');
    completeFlowCard('stretch', at('10:10'));
    expect(useSessionStore.getState().homeFocus).toBeNull();
  });

  it('gives capped extra Water stars from notifications', () => {
    playCard('water', 'home', at('09:00'));
    const results = [1, 2, 3, 4].map(
      (i) => playCard('water', 'notification', at('12:00') + i).kind,
    );
    expect(results).toEqual(['extraWater', 'extraWater', 'extraWater', 'repeat']);
    expect(useRewardsStore.getState().goldStars).toBe(
      ECONOMY.taskCard.stars + ECONOMY.extraWater.maxPerDay * ECONOMY.extraWater.stars,
    );
  });

  it('claims the Royal Flush with the 4th card and saves its mystery card', () => {
    playCard('water', 'home', at('09:00'));
    playCard('bathroom', 'home', at('11:00'));
    completeFlowCard('stretch', at('10:30'));
    const outcome = completeFlowCard('stand', at('15:30'))!;
    expect(outcome.royalFlush).not.toBeNull();
    const pending = saved(STORE_KEYS.rewards).pendingMysteryRewards;
    expect(pending.map((p: { source: string }) => p.source)).toContain('royalFlush');
    markRoyalFlushSeen(at('15:31'));
    expect(useProgressStore.getState().royalFlushSeenOn).toBe(DATE);
  });

  it('deals a new hand on a new day', () => {
    playCard('water', 'home', at('09:00'));
    ensureToday(atLocalTime('2026-11-24', '08:00'));
    expect(useProgressStore.getState().today.water).toMatchObject({
      date: '2026-11-24',
      status: 'pending',
    });
    expect(useProgressStore.getState().days[DATE].completed).toEqual(['water']);
  });
});

describe('other actions', () => {
  it('snoozes a card and clears its focus', () => {
    useSessionStore.setState({ homeFocus: 'water' });
    snoozeCard('water', at('09:00'));
    expect(useProgressStore.getState().today.water.status).toBe('snoozed');
    expect(useSessionStore.getState().homeFocus).toBeNull();
  });

  it('spends a ticket only when she has one', () => {
    expect(spendGameTicket()).toBe(false);
    playCard('water', 'home', at('09:00'));
    expect(spendGameTicket()).toBe(true);
    expect(useRewardsStore.getState().aceTickets).toBe(0);
  });

  it('awards a win, unlocks and equips an item', () => {
    useRewardsStore.setState({ goldStars: ECONOMY.itemPrices[1] - ECONOMY.solitaireWin.stars });
    expect(awardWin(at('12:00')).stars).toBe(ECONOMY.solitaireWin.stars);
    expect(unlockCollectionItem('cardBack.red1')).toBe(true);
    expect(equipCollectionItem('cardBack.red1')).toBe(true);
    expect(useRewardsStore.getState()).toMatchObject({
      goldStars: 0,
      equippedCardBack: 'cardBack.red1',
    });
    expect(unlockCollectionItem('no-such-item')).toBe(false);
  });

  it('reveals a mystery card once', () => {
    useRewardsStore.setState({
      pendingMysteryRewards: [
        { id: 'm1', source: 'milestone', seed: 5, createdAt: 1, milestoneStep: 10 },
      ],
    });
    expect(revealMystery('m1')).not.toBeNull();
    expect(revealMystery('m1')).toBeNull();
    expect(useRewardsStore.getState().pendingMysteryRewards).toEqual([]);
  });
});
