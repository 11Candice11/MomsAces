import { ECONOMY } from '../rewards/economy';
import { snoozeUntil, SNOOZE_MINUTES } from '../reminders/snooze';
import { TASK_FLOW, type TaskId } from './definitions';
import { isPlayed } from './hand';
import type { TodayHand } from './types';

export interface TaskCardReward {
  tickets: number;
  stars: number;
  pathSteps: number;
}

export const taskCardReward = (): TaskCardReward => ({ ...ECONOMY.taskCard });

export type DoneSource = 'home' | 'notification';

export type DoneResult =
  /** Water or Bathroom, first play today. */
  | { kind: 'played'; taskId: TaskId; reward: TaskCardReward }
  /** From Home: Stretch or Stand not yet played opens its guided flow. */
  | { kind: 'openFlow'; taskId: TaskId; flow: 'exercise' | 'stand' }
  /** From a "Start" notification: Home opens and Ace invites her to play the card. */
  | { kind: 'guide'; taskId: 'stretch' | 'stand' }
  /** "Done" on a Water notification for a played card, under the daily cap. */
  | { kind: 'extraWater'; stars: number; remainingToday: number }
  /** Everything else: a friendly Ace message and nothing more. */
  | { kind: 'repeat'; taskId: TaskId; message: 'alreadyPlayed' | 'waterEnough' };

/**
 * What a "Play card" tap, a card tap, or a notification "Done"/"Start" does (design section 6).
 * Pure: it decides; the store applies the result. Never silent (G10), never a repeat reward.
 */
export function resolveDone(today: TodayHand, taskId: TaskId, source: DoneSource): DoneResult {
  const day = today[taskId];
  if (isPlayed(day)) {
    if (taskId === 'water' && source === 'notification') {
      const { stars, maxPerDay } = ECONOMY.extraWater;
      if (day.extraWaterStars < maxPerDay) {
        return { kind: 'extraWater', stars, remainingToday: maxPerDay - day.extraWaterStars - 1 };
      }
      return { kind: 'repeat', taskId, message: 'waterEnough' };
    }
    return { kind: 'repeat', taskId, message: 'alreadyPlayed' };
  }
  const flow = TASK_FLOW[taskId];
  if (flow === 'instant') return { kind: 'played', taskId, reward: taskCardReward() };
  if (source === 'notification') return { kind: 'guide', taskId: taskId as 'stretch' | 'stand' };
  return { kind: 'openFlow', taskId, flow };
}

/**
 * Plays a card. Idempotent: a card already played today changes nothing and gives no reward
 * (R1.12, R3.3). Stretch and Stand call this only when their guided flow finishes.
 */
export function completeTask(
  today: TodayHand,
  taskId: TaskId,
  now: number,
): { today: TodayHand; reward: TaskCardReward | null } {
  const day = today[taskId];
  if (isPlayed(day)) return { today, reward: null };
  return {
    today: {
      ...today,
      [taskId]: { ...day, status: 'done', completedAt: now, snoozedUntil: undefined },
    },
    reward: taskCardReward(),
  };
}

/** "Later": the card's due time becomes `minutes` from now. A played card is left alone. */
export function snoozeTask(
  today: TodayHand,
  taskId: TaskId,
  now: number,
  minutes: number = SNOOZE_MINUTES,
): TodayHand {
  const day = today[taskId];
  if (isPlayed(day)) return today;
  return {
    ...today,
    [taskId]: { ...day, status: 'snoozed', snoozedUntil: snoozeUntil(now, minutes) },
  };
}

/** Records one extra Water star (only call after `resolveDone` returned `extraWater`). */
export function addExtraWater(today: TodayHand): TodayHand {
  const water = today.water;
  if (!isPlayed(water) || water.extraWaterStars >= ECONOMY.extraWater.maxPerDay) return today;
  return { ...today, water: { ...water, extraWaterStars: water.extraWaterStars + 1 } };
}

/** Tasks played in this hand. */
export function playedTasks(today: TodayHand): TaskId[] {
  return (Object.keys(today) as TaskId[]).filter((id) => isPlayed(today[id]));
}
