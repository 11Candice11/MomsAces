import type { TodayHand } from '../tasks/types';
import type { DayRecord, NewRank, PlayerRank, WeekState } from './types';

/** Her day-to-day progress (persisted by the progress store). */
export interface ProgressState {
  /** Archived days, pruned to the last 90. */
  days: Record<string, DayRecord>;
  today: TodayHand;
  /** Derived from pathPosition; stored for display. */
  rank: PlayerRank;
  rankLevel: number;
  /** Path steps. Never decreases. */
  pathPosition: number;
  dailyRoyalFlushClaimedOn: string | null;
  /** Date the Royal Flush celebration was shown; older or null means still to show. */
  royalFlushSeenOn: string | null;
  daysThisWeek: WeekState;
  medals: string[];
  claimedMilestones: number[];
  claimedRankUps: NewRank[];
}
