import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistOptions } from './persistOptions';
import { defaultRewards, sanitizeRewards, type RewardsData } from './sanitize';

/** Store actions that call the domain rules are added in task 3.8. */
export type RewardsStore = RewardsData;

export const pickRewards = (s: RewardsStore): RewardsData => ({
  aceTickets: s.aceTickets,
  goldStars: s.goldStars,
  unlockedItems: s.unlockedItems,
  equippedCardBack: s.equippedCardBack,
  equippedTable: s.equippedTable,
  gamesWon: s.gamesWon,
  pendingMysteryRewards: s.pendingMysteryRewards,
  lastRevealedPrize: s.lastRevealedPrize,
  newlyUnlockedItemIds: s.newlyUnlockedItemIds,
});

export const useRewardsStore = create<RewardsStore>()(
  persist(
    () => defaultRewards(),
    persistOptions<RewardsStore, RewardsData>({
      store: 'rewards',
      version: 2,
      pick: pickRewards,
      sanitize: sanitizeRewards,
    }),
  ),
);
