import { ECONOMY } from './economy';
import type { CollectionItemRef, RewardsState } from './state';

export function itemPrice(item: CollectionItemRef): number | null {
  return item.tier === null ? null : ECONOMY.itemPrices[item.tier];
}

export const isOwned = (rewards: RewardsState, itemId: string) =>
  rewards.unlockedItems.includes(itemId);

/** For sale, not owned yet, and she has enough stars. */
export function canUnlock(rewards: RewardsState, item: CollectionItemRef): boolean {
  const price = itemPrice(item);
  return price !== null && !isOwned(rewards, item.id) && rewards.goldStars >= price;
}

/** Spends stars on an item and marks it "New!". Null if it cannot be unlocked. */
export function unlockItem<R extends RewardsState>(rewards: R, item: CollectionItemRef): R | null {
  if (!canUnlock(rewards, item)) return null;
  return {
    ...rewards,
    goldStars: rewards.goldStars - itemPrice(item)!,
    unlockedItems: [...rewards.unlockedItems, item.id],
    newlyUnlockedItemIds: [...rewards.newlyUnlockedItemIds, item.id],
  };
}

/** Gives an item for free (a mystery prize). Owned items are left as they are. */
export function grantItem<R extends RewardsState>(rewards: R, itemId: string): R {
  if (isOwned(rewards, itemId)) return rewards;
  return {
    ...rewards,
    unlockedItems: [...rewards.unlockedItems, itemId],
    newlyUnlockedItemIds: [...rewards.newlyUnlockedItemIds, itemId],
  };
}

/** Uses an owned item and clears its "New!" ribbon. Null if it is not owned. */
export function equipItem<R extends RewardsState>(rewards: R, item: CollectionItemRef): R | null {
  if (!isOwned(rewards, item.id)) return null;
  const equipped =
    item.type === 'cardBack' ? { equippedCardBack: item.id } : { equippedTable: item.id };
  return markSeen({ ...rewards, ...equipped }, item.id);
}

/** Clears the "New!" ribbon of an item she has looked at. */
export function markSeen<R extends RewardsState>(rewards: R, itemId: string): R {
  if (!rewards.newlyUnlockedItemIds.includes(itemId)) return rewards;
  return {
    ...rewards,
    newlyUnlockedItemIds: rewards.newlyUnlockedItemIds.filter((id) => id !== itemId),
  };
}
