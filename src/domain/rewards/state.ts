import type { ItemTier } from './economy';
import type { PendingMystery, Prize } from './types';

/** Her balances and collection (persisted by the rewards store). */
export interface RewardsState {
  aceTickets: number;
  goldStars: number;
  unlockedItems: string[];
  equippedCardBack: string;
  equippedTable: string;
  gamesWon: number;
  pendingMysteryRewards: PendingMystery[];
  lastRevealedPrize: Prize | null;
  /** Items showing a "New!" ribbon. */
  newlyUnlockedItemIds: string[];
}

export type CollectionItemType = 'cardBack' | 'tableColour';

/** What the reward rules need to know about a collection item (the full entry is in src/data). */
export interface CollectionItemRef {
  id: string;
  type: CollectionItemType;
  /** Price tier; null for the free defaults, which are never for sale. */
  tier: ItemTier | null;
}
