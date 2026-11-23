import { addDays, mondayOf } from '../shared/dates';
import type { DayRecord, WeekState } from './types';

/** Weeks start on Monday. */
export const weekIdFor = (date: string) => mondayOf(date);

/** Starts a new, empty week silently when `today` is in a later week (R15.9). */
export function rollWeek(state: WeekState, today: string): WeekState {
  const weekId = weekIdFor(today);
  return state.weekId === weekId ? state : { weekId, litDays: [] };
}

/** Lights a day when at least one card is played on it. */
export function lightDay(state: WeekState, date: string): WeekState {
  const week = rollWeek(state, date);
  if (week.litDays.includes(date)) return week;
  return { ...week, litDays: [...week.litDays, date].sort() };
}

/** The "N" in "N days this week". Never negative. */
export function daysThisWeek(state: WeekState, today: string): number {
  return rollWeek(state, today).litDays.length;
}

/** Days in a week with at least one played card, from archived day records. */
export function litDays(days: Record<string, DayRecord>, weekId: string): string[] {
  const end = addDays(weekId, 7);
  return Object.values(days)
    .filter((d) => d.date >= weekId && d.date < end && d.completed.length > 0)
    .map((d) => d.date)
    .sort();
}
