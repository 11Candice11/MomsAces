import type { DayRecord, WeekState } from '../progression/types';
import { rollWeek } from '../progression/week';
import { ECONOMY } from '../rewards/economy';
import { addDays } from '../shared/dates';
import { playedTasks } from './completion';
import { freshHand } from './day';
import type { TodayHand } from './types';

/** Archived days are kept for this many days. */
export const DAYS_KEPT = 90;

export interface RolloverState {
  today: TodayHand;
  days: Record<string, DayRecord>;
  daysThisWeek: WeekState;
  dailyRoyalFlushClaimedOn: string | null;
}

/**
 * Starts a new day (R1.11): archives the old hand, deals a fresh one with all 4 cards pending
 * and resets "days this week" silently if a new week began. Nothing about unplayed cards is
 * recorded or shown (G3). Returns the input unchanged when the hand is already for `date`.
 */
export function rollDay<S extends RolloverState>(state: S, date: string): S {
  const handDate = state.today.water.date;
  if (handDate === date) return state;
  const completed = playedTasks(state.today);
  const ticketsEarned =
    completed.length * ECONOMY.taskCard.tickets +
    (state.dailyRoyalFlushClaimedOn === handDate ? ECONOMY.royalFlush.tickets : 0);
  const cutoff = addDays(date, -DAYS_KEPT);
  const days: Record<string, DayRecord> = {};
  for (const [key, record] of Object.entries(state.days)) {
    if (key > cutoff) days[key] = record;
  }
  if (handDate > cutoff && handDate < date) {
    days[handDate] = { date: handDate, completed, ticketsEarned };
  }
  return {
    ...state,
    today: freshHand(date),
    days,
    daysThisWeek: rollWeek(state.daysThisWeek, date),
  };
}
