import type { TaskId } from '../tasks/definitions';

/** The player's rank on the ladder. (The Solitaire card rank is a different type.) */
export type PlayerRank = 'jack' | 'queen' | 'king' | 'ace';

export const PLAYER_RANKS: readonly PlayerRank[] = ['jack', 'queen', 'king', 'ace'];

/** Ranks that grant a new-rank mystery card when first reached (not Jack, the start). */
export type NewRank = Exclude<PlayerRank, 'jack'>;

/** An archived day. */
export interface DayRecord {
  date: string;
  completed: TaskId[];
  ticketsEarned: number;
}

/** "N days this week": only ever positive, reset silently each Monday. */
export interface WeekState {
  /** Local date of the Monday that starts the week, 'YYYY-MM-DD'. */
  weekId: string;
  litDays: string[];
}
