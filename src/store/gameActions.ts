/**
 * Store actions (task 3.8): each one runs the pure domain rules, SAVES the result to the
 * persisted stores, and only then returns an outcome for the UI to celebrate (G9). If the app
 * closes during an animation, nothing is lost. Outcomes are plain data; screens decide which
 * celebrations to queue from them.
 */
import { findItem } from '@/data/collection';
import { PRIZE_TABLE } from '@/data/prizes';
import {
  awardWin as awardWinRule,
  claimExtraWater,
  ensureToday as ensureTodayRule,
  playTaskCard,
  type GameSnapshot,
  type TaskCardOutcome,
} from '@/domain/play/session';
import { equipItem, markSeen, unlockItem } from '@/domain/rewards/unlocks';
import { revealMystery as revealMysteryRule } from '@/domain/rewards/prizes';
import { spendTicket } from '@/domain/rewards/tickets';
import type { Prize } from '@/domain/rewards/types';
import type { MedalId } from '@/domain/rewards/medals';
import { localDateKey } from '@/domain/shared/dates';
import { resolveDone, snoozeTask, type DoneSource } from '@/domain/tasks/completion';
import type { TaskId } from '@/domain/tasks/definitions';
import { nextFocus } from '@/domain/tasks/hand';
import { pickProgress, useProgressStore } from './progressStore';
import { pickRewards, useRewardsStore } from './rewardsStore';
import { useSessionStore } from './sessionStore';

function read(): GameSnapshot {
  return {
    progress: pickProgress(useProgressStore.getState()),
    rewards: pickRewards(useRewardsStore.getState()),
  };
}

/** Saves both stores (MMKV writes synchronously). */
function commit(next: GameSnapshot, prev: GameSnapshot) {
  if (next.rewards !== prev.rewards) useRewardsStore.setState(next.rewards);
  if (next.progress !== prev.progress) useProgressStore.setState(next.progress);
}

/** Deals a fresh hand if the date has changed (launch, and Home gaining focus). */
export function ensureToday(now: number = Date.now()): void {
  const prev = read();
  commit(ensureTodayRule(prev, localDateKey(now)), prev);
}

export type PlayCardResult =
  | { kind: 'played'; outcome: TaskCardOutcome }
  | { kind: 'openFlow'; taskId: TaskId; flow: 'exercise' | 'stand' }
  | { kind: 'guide'; taskId: 'stretch' | 'stand' }
  | { kind: 'extraWater'; stars: number; remainingToday: number }
  | { kind: 'repeat'; taskId: TaskId; message: 'alreadyPlayed' | 'waterEnough' };

/**
 * "Play card", a card tap, or a notification "Done"/"Start". Water and Bathroom are played and
 * rewarded at once; Stretch and Stand open their guided flow (from Home) or become the focus card
 * (from a notification). Repeats give only a message, or the capped extra Water star.
 */
export function playCard(
  taskId: TaskId,
  source: DoneSource,
  now: number = Date.now(),
): PlayCardResult {
  const date = localDateKey(now);
  const start = read();
  const prev = ensureTodayRule(start, date);
  commit(prev, start);
  const session = useSessionStore.getState();
  const result = resolveDone(prev.progress.today, taskId, source);

  switch (result.kind) {
    case 'played': {
      const played = playTaskCard(prev, taskId, now, date);
      if (!played) return { kind: 'repeat', taskId, message: 'alreadyPlayed' };
      commit(played.snapshot, prev);
      session.setHomeFocus(nextFocus(session.homeFocus, { type: 'play', taskId }));
      return { kind: 'played', outcome: played.outcome };
    }
    case 'extraWater': {
      commit(claimExtraWater(prev), prev);
      return result;
    }
    case 'guide':
      session.setHomeFocus(result.taskId);
      return result;
    case 'openFlow':
    case 'repeat':
      return result;
  }
}

/**
 * Plays Stretch or Stand when its guided flow finishes (Exercise Session, Stand With Help).
 * Null if it was already played today.
 */
export function completeFlowCard(
  taskId: 'stretch' | 'stand',
  now: number = Date.now(),
): TaskCardOutcome | null {
  const prev = read();
  const played = playTaskCard(prev, taskId, now, localDateKey(now));
  if (!played) return null;
  commit(played.snapshot, prev);
  const session = useSessionStore.getState();
  session.setHomeFocus(nextFocus(session.homeFocus, { type: 'play', taskId }));
  return played.outcome;
}

/** "Later": the card moves 10 minutes on. The notification for it is scheduled in task 6. */
export function snoozeCard(taskId: TaskId, now: number = Date.now()): void {
  const start = read();
  const prev = ensureTodayRule(start, localDateKey(now));
  const today = snoozeTask(prev.progress.today, taskId, now);
  commit({ ...prev, progress: { ...prev.progress, today } }, start);
  const session = useSessionStore.getState();
  session.setHomeFocus(nextFocus(session.homeFocus, { type: 'snooze', taskId }));
}

/** Spends the ticket for a new Solitaire game. False if she has none. */
export function spendGameTicket(): boolean {
  const next = spendTicket(pickRewards(useRewardsStore.getState()));
  if (!next) return false;
  useRewardsStore.setState(next);
  return true;
}

/** A Solitaire win (also "Finish for me"). */
export function awardWin(now: number = Date.now()): { stars: number; newMedals: MedalId[] } {
  const prev = read();
  const won = awardWinRule(prev, localDateKey(now));
  commit(won.snapshot, prev);
  return { stars: won.stars, newMedals: won.newMedals };
}

export function unlockCollectionItem(itemId: string): boolean {
  const item = findItem(itemId);
  const next = item ? unlockItem(pickRewards(useRewardsStore.getState()), item) : null;
  if (!next) return false;
  useRewardsStore.setState(next);
  return true;
}

export function equipCollectionItem(itemId: string): boolean {
  const item = findItem(itemId);
  const next = item ? equipItem(pickRewards(useRewardsStore.getState()), item) : null;
  if (!next) return false;
  useRewardsStore.setState(next);
  return true;
}

export function markItemSeen(itemId: string): void {
  const prev = pickRewards(useRewardsStore.getState());
  const next = markSeen(prev, itemId);
  if (next !== prev) useRewardsStore.setState(next);
}

/** Reveals one waiting mystery card. Null if it was already revealed. */
export function revealMystery(pendingId: string): Prize | null {
  const result = revealMysteryRule(pickRewards(useRewardsStore.getState()), pendingId, PRIZE_TABLE);
  if (!result) return null;
  useRewardsStore.setState(result.rewards);
  return result.prize;
}

/** Records that today's Royal Flush celebration has been shown (R16.4). */
export function markRoyalFlushSeen(now: number = Date.now()): void {
  useProgressStore.setState({ royalFlushSeenOn: localDateKey(now) });
}
