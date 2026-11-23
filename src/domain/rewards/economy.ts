/**
 * EVERY reward number, cost and price in the app (R3.8). Nothing else in `src` repeats these
 * numbers: code, data tables and tests import them from here, so tuning happens in one place.
 */
export const ECONOMY = {
  /** Each task card played (Water, Bathroom, a finished exercise session, Stand With Help). */
  taskCard: { tickets: 1, stars: 5, pathSteps: 1 },
  /** "Done" on a Water notification for a card already played today. */
  extraWater: { stars: 1, maxPerDay: 3 },
  solitaireWin: { stars: 15 },
  royalFlush: { tickets: 2, stars: 20, mysteryCards: 1, pathSteps: 2 },
  milestoneChest: { mysteryCards: 1 },
  /** Reaching Queen, King or Ace (not each level). */
  newRank: { mysteryCards: 1 },
  /** Exactly one prize per mystery reveal. */
  mysteryPrize: {
    tickets: [
      { amount: 1, weight: 40 },
      { amount: 2, weight: 20 },
    ],
    stars: [
      { amount: 10, weight: 20 },
      { amount: 25, weight: 8 },
    ],
    /** Weight per unowned item. */
    itemWeight: { cardBack: 2, tableColour: 2 },
    /** Used when nothing else can be picked. */
    fallbackStars: 10,
  },
  costs: { solitaireGameTickets: 1 },
  /** Collection prices in stars, by tier. The cheapest is 50. */
  itemPrices: { 1: 50, 2: 100, 3: 200 },
} as const;

export type ItemTier = keyof typeof ECONOMY.itemPrices;
