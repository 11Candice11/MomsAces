/** The four daily tasks. Each is one card in Today's Hand. */
export type TaskId = 'water' | 'bathroom' | 'stretch' | 'stand';

/** Order of the small cards on Home (R1.1). */
export const HAND_ORDER: readonly TaskId[] = ['water', 'bathroom', 'stretch', 'stand'];

/** Tie-break order when two pending cards have the same due time (design section 6). */
export const TIE_ORDER: readonly TaskId[] = ['water', 'stretch', 'bathroom', 'stand'];

export const TASK_IDS: readonly TaskId[] = HAND_ORDER;

/** Water and Bathroom complete at once; Stretch and Stand only through their guided flows. */
export type TaskFlow = 'instant' | 'exercise' | 'stand';

export const TASK_FLOW: Readonly<Record<TaskId, TaskFlow>> = {
  water: 'instant',
  bathroom: 'instant',
  stretch: 'exercise',
  stand: 'stand',
};

export function isTaskId(value: unknown): value is TaskId {
  return typeof value === 'string' && (TASK_IDS as readonly string[]).includes(value);
}

/** Reminder times per task, as 'HH:mm' strings (1 to 3 per task). */
export type ReminderTimes = Record<TaskId, string[]>;

/** The default daily reminders (R2.1). The only place these times are written. */
export const DEFAULT_REMINDER_TIMES: Readonly<Record<TaskId, readonly string[]>> = {
  water: ['09:00', '12:00', '17:00'],
  stretch: ['10:00'],
  bathroom: ['11:00', '16:00'],
  stand: ['15:00'],
};

export const MAX_REMINDERS_PER_TASK = 3;

/** A fresh, mutable copy of the default reminder times. */
export function defaultReminderTimes(): ReminderTimes {
  return {
    water: [...DEFAULT_REMINDER_TIMES.water],
    bathroom: [...DEFAULT_REMINDER_TIMES.bathroom],
    stretch: [...DEFAULT_REMINDER_TIMES.stretch],
    stand: [...DEFAULT_REMINDER_TIMES.stand],
  };
}
