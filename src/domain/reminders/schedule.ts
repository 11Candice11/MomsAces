import {
  MAX_REMINDERS_PER_TASK,
  TASK_IDS,
  TIE_ORDER,
  type ReminderTimes,
  type TaskId,
} from '../tasks/definitions';
import { isValidTime, minutesOfDay } from './time';

export interface Reminder {
  /** '<taskId>-HH:mm' */
  id: string;
  taskId: TaskId;
  time: string;
  /** True for the earliest reminder of its task (later ones are gentler nudges). */
  firstOfDay: boolean;
}

/** Every reminder, sorted by time (ties follow the hand tie order). */
export function buildSchedule(times: ReminderTimes): Reminder[] {
  const reminders: Reminder[] = [];
  for (const taskId of TASK_IDS) {
    const sorted = [...new Set(times[taskId])].filter(isValidTime).sort();
    sorted.forEach((time, index) => {
      reminders.push({ id: `${taskId}-${time}`, taskId, time, firstOfDay: index === 0 });
    });
  }
  return reminders.sort(
    (a, b) =>
      minutesOfDay(a.time) - minutesOfDay(b.time) ||
      TIE_ORDER.indexOf(a.taskId) - TIE_ORDER.indexOf(b.taskId),
  );
}

export type ReminderTimesError =
  | { error: 'badFormat'; taskId: TaskId; time: string }
  | { error: 'noTimes'; taskId: TaskId }
  | { error: 'tooMany'; taskId: TaskId }
  | { error: 'duplicate'; taskId: TaskId; time: string }
  | { error: 'sameMinute'; taskId: TaskId; otherTaskId: TaskId; time: string };

/**
 * Checks entered reminder times (R2.17). Returns null when they are fine, otherwise the first
 * problem as a code the Settings screen turns into a friendly line.
 */
export function validateReminderTimes(times: ReminderTimes): ReminderTimesError | null {
  const owner = new Map<string, TaskId>();
  for (const taskId of TASK_IDS) {
    const list = times[taskId] ?? [];
    if (list.length === 0) return { error: 'noTimes', taskId };
    if (list.length > MAX_REMINDERS_PER_TASK) return { error: 'tooMany', taskId };
    const seen = new Set<string>();
    for (const time of list) {
      if (!isValidTime(time)) return { error: 'badFormat', taskId, time };
      if (seen.has(time)) return { error: 'duplicate', taskId, time };
      seen.add(time);
      const other = owner.get(time);
      if (other) return { error: 'sameMinute', taskId, otherTaskId: other, time };
      owner.set(time, taskId);
    }
  }
  return null;
}

/** The earliest reminder time of the day across all tasks. */
export function firstReminderTime(times: ReminderTimes): string | null {
  return buildSchedule(times)[0]?.time ?? null;
}
