import type { TaskId } from './definitions';

export type TaskStatus = 'pending' | 'done' | 'snoozed';

/** One task on one day. Each task can be played once per day. */
export interface TaskDay {
  taskId: TaskId;
  /** Local date, 'YYYY-MM-DD'. */
  date: string;
  status: TaskStatus;
  /** Epoch ms when the snooze ends. */
  snoozedUntil?: number;
  /** Epoch ms when the card was played. */
  completedAt?: number;
  /** Water only: repeat-Done stars earned today (0 to the economy cap). */
  extraWaterStars: number;
}

export type TodayHand = Record<TaskId, TaskDay>;
