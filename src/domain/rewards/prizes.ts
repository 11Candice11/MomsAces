import { mulberry32 } from '../shared/rng';
import { ECONOMY } from './economy';
import { grantItem } from './unlocks';
import type { CollectionItemRef, RewardsState } from './state';
import type { MysterySource, PendingMystery, Prize, PrizeEntry } from './types';
import { awardTicket } from './tickets';
import { awardStars } from './stars';

/** Builds the prize table from economy.ts and the items for sale. It has no numbers of its own. */
export function buildPrizeTable(items: readonly CollectionItemRef[]): PrizeEntry[] {
  const { tickets, stars, itemWeight } = ECONOMY.mysteryPrize;
  return [
    ...tickets.map((t) => ({
      id: `tickets-${t.amount}`,
      type: 'tickets' as const,
      amount: t.amount,
      weight: t.weight,
    })),
    ...stars.map((s) => ({
      id: `stars-${s.amount}`,
      type: 'stars' as const,
      amount: s.amount,
      weight: s.weight,
    })),
    ...items
      .filter((item) => item.tier !== null)
      .map((item) => ({
        id: `item-${item.id}`,
        type: 'item' as const,
        itemId: item.id,
        weight: itemWeight[item.type],
      })),
  ];
}

export const fallbackPrize = (): Prize => ({
  type: 'stars',
  amount: ECONOMY.mysteryPrize.fallbackStars,
});

function toPrize(entry: PrizeEntry): Prize | null {
  if (entry.type === 'item') return entry.itemId ? { type: 'item', itemId: entry.itemId } : null;
  return entry.amount && entry.amount > 0 ? { type: entry.type, amount: entry.amount } : null;
}

/**
 * Picks exactly one prize (R17). Deterministic for a seed. Items she owns are never chosen; if
 * nothing is left, the fallback stars are given. Never throws, always a prize.
 */
export function pickPrize(
  table: readonly PrizeEntry[],
  seed: number,
  ownedItemIds: readonly string[],
): Prize {
  const owned = new Set(ownedItemIds);
  const entries = table.filter(
    (e) =>
      e.weight > 0 &&
      toPrize(e) !== null &&
      !(e.type === 'item' && e.itemId !== undefined && owned.has(e.itemId)),
  );
  const total = entries.reduce((sum, e) => sum + e.weight, 0);
  if (entries.length === 0 || total <= 0) return fallbackPrize();
  let r = mulberry32(seed)() * total;
  for (const entry of entries) {
    r -= entry.weight;
    if (r < 0) return toPrize(entry)!;
  }
  return toPrize(entries[entries.length - 1])!;
}

/** A new unrevealed mystery card. The seed is fixed now so reopening the app never rerolls it. */
export function createPendingMystery(
  source: MysterySource,
  seed: number,
  now: number,
  milestoneStep?: number,
): PendingMystery {
  const pending: PendingMystery = {
    id: `${source}-${milestoneStep ?? 'x'}-${now}-${seed >>> 0}`,
    source,
    seed: seed >>> 0,
    createdAt: now,
  };
  if (milestoneStep !== undefined) pending.milestoneStep = milestoneStep;
  return pending;
}

export function applyPrize<R extends RewardsState>(rewards: R, prize: Prize): R {
  if (prize.type === 'tickets') return awardTicket(rewards, prize.amount);
  if (prize.type === 'stars') return awardStars(rewards, prize.amount);
  return grantItem(rewards, prize.itemId);
}

/**
 * Reveals one waiting mystery card: exactly one prize is applied, the card is removed and the
 * prize is remembered. Null if no such card is waiting (so a double tap cannot reveal twice).
 */
export function revealMystery<R extends RewardsState>(
  rewards: R,
  pendingId: string,
  table: readonly PrizeEntry[],
): { rewards: R; prize: Prize } | null {
  const pending = rewards.pendingMysteryRewards.find((p) => p.id === pendingId);
  if (!pending) return null;
  const prize = pickPrize(table, pending.seed, rewards.unlockedItems);
  const applied = applyPrize(rewards, prize);
  return {
    prize,
    rewards: {
      ...applied,
      pendingMysteryRewards: rewards.pendingMysteryRewards.filter((p) => p.id !== pendingId),
      lastRevealedPrize: prize,
    },
  };
}
