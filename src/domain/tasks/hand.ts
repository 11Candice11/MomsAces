import { firstReminderTime } from '../reminders/schedule';
import { timeOfEpoch } from '../reminders/time';
import { atLocalTime } from '../shared/dates';
import { HAND_ORDER, TIE_ORDER, type ReminderTimes, type TaskId } from './definitions';
import type { TaskDay, TodayHand } from './types';

export interface HandCard {
  taskId: TaskId;
  state: 'pending' | 'played';
  /** 'HH:mm' the card is due: its earliest reminder, or the end of its snooze. */
  dueTime: string;
  /** Epoch ms of `dueTime` today. */
  dueAt: number;
  /** Due now. Always false for a played card. */
  isDue: boolean;
}

export interface HandState {
  /** The 4 cards in hand order (Water, Bathroom, Stretch, Stand). */
  cards: HandCard[];
  /** The NEXT card; null only when all 4 are played. */
  next: TaskId | null;
  playedCount: number;
}

export const isPlayed = (day: TaskDay) => day.status === 'done';

function earliestTime(times: ReminderTimes, taskId: TaskId): string {
  return [...times[taskId]].sort()[0] ?? '00:00';
}

/**
 * The single source of truth for the featured card and the small row on Home (design section 6).
 * `focus` is the card she came for from a notification; it is NEXT while it is pending.
 */
export function handState(
  today: TodayHand,
  times: ReminderTimes,
  now: number,
  focus: TaskId | null = null,
): HandState {
  const cards = HAND_ORDER.map((taskId): HandCard => {
    const day = today[taskId];
    const played = isPlayed(day);
    const snoozed = !played && day.status === 'snoozed' && day.snoozedUntil !== undefined;
    const dueAt = snoozed ? day.snoozedUntil! : atLocalTime(day.date, earliestTime(times, taskId));
    return {
      taskId,
      state: played ? 'played' : 'pending',
      dueTime: snoozed ? timeOfEpoch(dueAt) : earliestTime(times, taskId),
      dueAt,
      isDue: !played && dueAt <= now,
    };
  });

  const pending = cards.filter((c) => c.state === 'pending');
  const byDue = (a: HandCard, b: HandCard) =>
    a.dueAt - b.dueAt || TIE_ORDER.indexOf(a.taskId) - TIE_ORDER.indexOf(b.taskId);

  let next: TaskId | null = null;
  if (focus && pending.some((c) => c.taskId === focus)) {
    next = focus;
  } else {
    const due = pending.filter((c) => c.isDue).sort(byDue);
    next = (due[0] ?? [...pending].sort(byDue)[0])?.taskId ?? null;
  }

  return { cards, next, playedCount: cards.length - pending.length };
}

export type AceMood = 'sleeping' | 'awake' | 'allPlayed';

/**
 * Ace on Home (R14.6): sleeping before her first reminder of the day while no card is due,
 * waving once all 4 cards are played, awake otherwise.
 */
export function aceMood(hand: HandState, times: ReminderTimes, date: string, now: number): AceMood {
  if (hand.playedCount === hand.cards.length) return 'allPlayed';
  const first = firstReminderTime(times);
  const beforeFirst = first !== null && now < atLocalTime(date, first);
  const anyDue = hand.cards.some((c) => c.isDue);
  return beforeFirst && !anyDue ? 'sleeping' : 'awake';
}

/** The focus card clears when she plays any card or snoozes the focus card (design section 6). */
export function nextFocus(
  focus: TaskId | null,
  action: { type: 'play' | 'snooze'; taskId: TaskId },
): TaskId | null {
  if (focus === null) return null;
  if (action.type === 'play') return null;
  return action.taskId === focus ? null : focus;
}
