import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { localDateKey } from '@/domain/shared/dates';
import { persistOptions } from './persistOptions';
import { defaultProgress, sanitizeProgress, type ProgressData } from './sanitize';

/** Store actions that call the domain rules are added in task 3.8. */
export type ProgressStore = ProgressData;

export const pickProgress = (s: ProgressStore): ProgressData => ({
  days: s.days,
  today: s.today,
  rank: s.rank,
  rankLevel: s.rankLevel,
  pathPosition: s.pathPosition,
  dailyRoyalFlushClaimedOn: s.dailyRoyalFlushClaimedOn,
  royalFlushSeenOn: s.royalFlushSeenOn,
  daysThisWeek: s.daysThisWeek,
  medals: s.medals,
  claimedMilestones: s.claimedMilestones,
  claimedRankUps: s.claimedRankUps,
});

export const useProgressStore = create<ProgressStore>()(
  persist(
    () => defaultProgress(localDateKey(Date.now())),
    persistOptions<ProgressStore, ProgressData>({
      store: 'progress',
      version: 2,
      pick: pickProgress,
      sanitize: (raw) => sanitizeProgress(raw, localDateKey(Date.now())),
    }),
  ),
);
