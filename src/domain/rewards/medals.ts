import { rankFromPosition } from '../progression/rank';
import type { DayRecord, PlayerRank } from '../progression/types';
import type { TaskId } from '../tasks/definitions';

/** Starter medals (R9.10). Names and descriptions are in src/data/medals.ts. */
export const MEDAL_IDS = [
  'firstCard',
  'fiveDaysWater',
  'firstRoyalFlush',
  'firstWin',
  'reachedQueen',
  'reachedKing',
  'reachedAce',
] as const;

export type MedalId = (typeof MEDAL_IDS)[number];

/** "5 Days of Water": five different days with Water played (any days, not in a row). */
export const WATER_DAYS_FOR_MEDAL = 5;

export interface MedalInput {
  days: Record<string, DayRecord>;
  /** Today's date and the tasks played so far today. */
  today: { date: string; played: readonly TaskId[] };
  pathPosition: number;
  dailyRoyalFlushClaimedOn: string | null;
  gamesWon: number;
  earned: readonly string[];
}

const RANK_ORDER: readonly PlayerRank[] = ['jack', 'queen', 'king', 'ace'];

/** Medals earned now that were not earned before. Medals are only ever added. */
export function evaluateMedals(input: MedalInput): MedalId[] {
  const archived = Object.values(input.days).filter((d) => d.date !== input.today.date);
  const anyPlayed = input.today.played.length > 0 || archived.some((d) => d.completed.length > 0);
  const waterDays =
    archived.filter((d) => d.completed.includes('water')).length +
    (input.today.played.includes('water') ? 1 : 0);
  const rankIndex = RANK_ORDER.indexOf(rankFromPosition(input.pathPosition).rank);

  const earnedNow: Record<MedalId, boolean> = {
    firstCard: anyPlayed,
    fiveDaysWater: waterDays >= WATER_DAYS_FOR_MEDAL,
    firstRoyalFlush: input.dailyRoyalFlushClaimedOn !== null,
    firstWin: input.gamesWon >= 1,
    reachedQueen: rankIndex >= 1,
    reachedKing: rankIndex >= 2,
    reachedAce: rankIndex >= 3,
  };
  return MEDAL_IDS.filter((id) => earnedNow[id] && !input.earned.includes(id));
}
