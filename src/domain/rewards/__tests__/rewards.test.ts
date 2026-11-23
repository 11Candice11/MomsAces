import { ECONOMY } from '../economy';
import { evaluateMedals, MEDAL_IDS, type MedalInput } from '../medals';
import {
  applyPrize,
  buildPrizeTable,
  createPendingMystery,
  fallbackPrize,
  pickPrize,
  revealMystery,
} from '../prizes';
import { awardStars } from '../stars';
import type { CollectionItemRef, RewardsState } from '../state';
import { awardTicket, spendTicket } from '../tickets';
import { canUnlock, equipItem, grantItem, markSeen, unlockItem } from '../unlocks';

const base = (patch: Partial<RewardsState> = {}): RewardsState => ({
  aceTickets: 0,
  goldStars: 0,
  unlockedItems: ['cardBack.default', 'table.default'],
  equippedCardBack: 'cardBack.default',
  equippedTable: 'table.default',
  gamesWon: 0,
  pendingMysteryRewards: [],
  lastRevealedPrize: null,
  newlyUnlockedItemIds: [],
  ...patch,
});

const ITEMS: CollectionItemRef[] = [
  { id: 'cardBack.default', type: 'cardBack', tier: null },
  { id: 'cb1', type: 'cardBack', tier: 1 },
  { id: 'tc2', type: 'tableColour', tier: 2 },
  { id: 'cb3', type: 'cardBack', tier: 3 },
];
const [defaultBack, cb1, tc2] = ITEMS;

describe('economy invariants', () => {
  const numbers: number[] = [];
  const walk = (v: unknown) => {
    if (typeof v === 'number') numbers.push(v);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(ECONOMY);

  it('holds only non-negative integers', () => {
    expect(numbers.length).toBeGreaterThan(10);
    numbers.forEach((n) => {
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThanOrEqual(0);
    });
  });

  it('has positive weights', () => {
    [...ECONOMY.mysteryPrize.tickets, ...ECONOMY.mysteryPrize.stars].forEach((e) => {
      expect(e.weight).toBeGreaterThan(0);
      expect(e.amount).toBeGreaterThan(0);
    });
    Object.values(ECONOMY.mysteryPrize.itemWeight).forEach((w) => expect(w).toBeGreaterThan(0));
    expect(ECONOMY.mysteryPrize.fallbackStars).toBeGreaterThan(0);
  });

  it('prices ascend by tier and the cheapest is the minimum', () => {
    const { 1: t1, 2: t2, 3: t3 } = ECONOMY.itemPrices;
    expect(t1).toBeLessThan(t2);
    expect(t2).toBeLessThan(t3);
    expect(Math.min(...Object.values(ECONOMY.itemPrices))).toBe(t1);
  });
});

describe('tickets and stars', () => {
  it('awards the task-card amounts', () => {
    const r = awardStars(awardTicket(base(), ECONOMY.taskCard.tickets), ECONOMY.taskCard.stars);
    expect(r.aceTickets).toBe(ECONOMY.taskCard.tickets);
    expect(r.goldStars).toBe(ECONOMY.taskCard.stars);
  });

  it('spends a ticket but never below 0', () => {
    const cost = ECONOMY.costs.solitaireGameTickets;
    expect(spendTicket(base({ aceTickets: cost }))?.aceTickets).toBe(0);
    expect(spendTicket(base({ aceTickets: cost - 1 }))).toBeNull();
  });

  it('ignores negative amounts', () => {
    expect(awardStars(base(), -5).goldStars).toBe(0);
    expect(awardTicket(base(), -1).aceTickets).toBe(0);
  });
});

describe('unlocks', () => {
  const price = ECONOMY.itemPrices[1];

  it('unlocks with enough stars and marks it New', () => {
    const r = unlockItem(base({ goldStars: price }), cb1)!;
    expect(r.goldStars).toBe(0);
    expect(r.unlockedItems).toContain('cb1');
    expect(r.newlyUnlockedItemIds).toEqual(['cb1']);
  });

  it('refuses without enough stars, twice, or for a free default', () => {
    expect(unlockItem(base({ goldStars: price - 1 }), cb1)).toBeNull();
    const owned = unlockItem(base({ goldStars: price * 3 }), cb1)!;
    expect(unlockItem(owned, cb1)).toBeNull();
    expect(canUnlock(base({ goldStars: 1000 }), defaultBack)).toBe(false);
  });

  it('equips only owned items and clears New', () => {
    expect(equipItem(base(), tc2)).toBeNull();
    const owned = unlockItem(base({ goldStars: ECONOMY.itemPrices[2] }), tc2)!;
    const equipped = equipItem(owned, tc2)!;
    expect(equipped.equippedTable).toBe('tc2');
    expect(equipped.equippedCardBack).toBe('cardBack.default');
    expect(equipped.newlyUnlockedItemIds).toEqual([]);
  });

  it('markSeen clears only that ribbon', () => {
    const r = base({ newlyUnlockedItemIds: ['a', 'b'] });
    expect(markSeen(r, 'a').newlyUnlockedItemIds).toEqual(['b']);
    expect(markSeen(r, 'zzz')).toBe(r);
  });

  it('grantItem gives an item for free', () => {
    const r = grantItem(base(), 'cb3');
    expect(r.unlockedItems).toContain('cb3');
    expect(r.goldStars).toBe(0);
    expect(grantItem(r, 'cb3')).toBe(r);
  });
});

describe('mystery prizes', () => {
  const table = buildPrizeTable(ITEMS);

  it('builds the table from the economy and items for sale only', () => {
    expect(table.filter((e) => e.type === 'item').map((e) => e.itemId)).toEqual([
      'cb1',
      'tc2',
      'cb3',
    ]);
    expect(table.filter((e) => e.type === 'tickets')).toHaveLength(
      ECONOMY.mysteryPrize.tickets.length,
    );
  });

  it('is deterministic for a seed', () => {
    for (let seed = 0; seed < 50; seed++) {
      expect(pickPrize(table, seed, [])).toEqual(pickPrize(table, seed, []));
    }
  });

  it('respects the weights over many seeds', () => {
    const total = table.reduce((s, e) => s + e.weight, 0);
    const runs = 20_000;
    const counts = new Map<string, number>();
    for (let seed = 0; seed < runs; seed++) {
      const p = pickPrize(table, seed * 7919 + 1, []);
      const key = p.type === 'item' ? `item-${p.itemId}` : `${p.type}-${p.amount}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    for (const entry of table) {
      const expected = entry.weight / total;
      const actual = (counts.get(entry.id) ?? 0) / runs;
      expect(Math.abs(actual - expected)).toBeLessThan(0.02);
    }
  });

  it('never picks an owned item', () => {
    for (let seed = 0; seed < 2000; seed++) {
      const p = pickPrize(table, seed, ['cb1', 'tc2']);
      if (p.type === 'item') expect(p.itemId).toBe('cb3');
    }
  });

  it('falls back to stars when nothing can be picked', () => {
    expect(pickPrize([], 1, [])).toEqual(fallbackPrize());
    const onlyItems = table.filter((e) => e.type === 'item');
    expect(pickPrize(onlyItems, 1, ['cb1', 'tc2', 'cb3'])).toEqual(fallbackPrize());
  });

  it('reveals exactly one prize, removes the card and never rerolls', () => {
    const pending = createPendingMystery('royalFlush', 12345, 1000);
    const start = base({ pendingMysteryRewards: [pending] });
    // "Reload": the same pending card gives the same prize.
    const first = revealMystery(start, pending.id, table)!;
    const reloaded = revealMystery(
      JSON.parse(JSON.stringify(start)) as RewardsState,
      pending.id,
      table,
    )!;
    expect(reloaded.prize).toEqual(first.prize);
    expect(first.rewards.pendingMysteryRewards).toEqual([]);
    expect(first.rewards.lastRevealedPrize).toEqual(first.prize);
    expect(first.rewards).toEqual({
      ...applyPrize(start, first.prize),
      pendingMysteryRewards: [],
      lastRevealedPrize: first.prize,
    });
    // A second reveal of the same card does nothing.
    expect(revealMystery(first.rewards, pending.id, table)).toBeNull();
  });

  it('an item prize is unlocked and marked New', () => {
    const r = applyPrize(base(), { type: 'item', itemId: 'cb1' });
    expect(r.unlockedItems).toContain('cb1');
    expect(r.newlyUnlockedItemIds).toContain('cb1');
  });

  it('pending cards keep their seed and step', () => {
    expect(createPendingMystery('milestone', 7, 99, 10)).toMatchObject({
      source: 'milestone',
      seed: 7,
      createdAt: 99,
      milestoneStep: 10,
    });
  });
});

describe('medals', () => {
  const input = (patch: Partial<MedalInput>): MedalInput => ({
    days: {},
    today: { date: '2026-11-23', played: [] },
    pathPosition: 0,
    dailyRoyalFlushClaimedOn: null,
    gamesWon: 0,
    earned: [],
    ...patch,
  });

  it('earns nothing at the start', () => {
    expect(evaluateMedals(input({}))).toEqual([]);
  });

  it('earns First Card Played, First Win and First Royal Flush', () => {
    expect(
      evaluateMedals(
        input({
          today: { date: '2026-11-23', played: ['water'] },
          gamesWon: 1,
          dailyRoyalFlushClaimedOn: '2026-11-23',
        }),
      ),
    ).toEqual(['firstCard', 'firstRoyalFlush', 'firstWin']);
  });

  it('counts 5 different days of Water, not in a row', () => {
    const days = Object.fromEntries(
      ['2026-11-01', '2026-11-05', '2026-11-09', '2026-11-12'].map((d) => [
        d,
        { date: d, completed: ['water' as const], ticketsEarned: 1 },
      ]),
    );
    expect(evaluateMedals(input({ days, earned: ['firstCard'] }))).toEqual([]);
    expect(
      evaluateMedals(
        input({ days, earned: ['firstCard'], today: { date: '2026-11-23', played: ['water'] } }),
      ),
    ).toEqual(['fiveDaysWater']);
  });

  it('earns rank medals once each', () => {
    expect(evaluateMedals(input({ pathPosition: 200, earned: ['reachedQueen'] }))).toEqual([
      'reachedKing',
    ]);
    expect(evaluateMedals(input({ pathPosition: 300, earned: [...MEDAL_IDS] }))).toEqual([]);
  });
});
