import { HAND_ORDER, type TaskId } from './definitions';
import type { TaskDay, TodayHand } from './types';

/** A fresh hand for a date: all 4 cards pending (R1.11). */
export function freshHand(date: string): TodayHand {
  const hand = {} as TodayHand;
  for (const taskId of HAND_ORDER) {
    hand[taskId] = freshTaskDay(taskId, date);
  }
  return hand;
}

export function freshTaskDay(taskId: TaskId, date: string): TaskDay {
  return { taskId, date, status: 'pending', extraWaterStars: 0 };
}
