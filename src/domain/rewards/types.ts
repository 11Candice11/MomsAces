export type Prize =
  | { type: 'tickets'; amount: number }
  | { type: 'stars'; amount: number }
  | { type: 'item'; itemId: string };

export type MysterySource = 'royalFlush' | 'milestone' | 'rankUp';

/** An unrevealed mystery card. The seed is fixed when it is created, so the prize never rerolls. */
export interface PendingMystery {
  id: string;
  source: MysterySource;
  /** Links a Path chest or rank node to its waiting card. */
  milestoneStep?: number;
  seed: number;
  createdAt: number;
}

export interface PrizeEntry {
  id: string;
  type: 'tickets' | 'stars' | 'item';
  amount?: number;
  itemId?: string;
  weight: number;
}

/** Unlocked from the start and never for sale. */
export const DEFAULT_CARD_BACK_ID = 'cardBack.default';
export const DEFAULT_TABLE_ID = 'table.default';
