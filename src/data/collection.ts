/**
 * My Collection (R9.1, R9.13): 9 items for sale, 3 per theme, plus the free defaults.
 * Per theme: tier 1 card back, tier 2 table colour, tier 3 card back. Prices come from
 * `ECONOMY.itemPrices` by tier; this file holds no reward numbers.
 * Visuals are placeholder colours until card-back art is supplied (task 13.5).
 */
import type { ItemTier } from '@/domain/rewards/economy';
import type { CollectionItemRef } from '@/domain/rewards/state';
import { DEFAULT_CARD_BACK_ID, DEFAULT_TABLE_ID } from '@/domain/rewards/types';
import type { StringKey } from '@/strings';

export type CollectionTheme = 'red' | 'purple' | 'gold' | 'default';

export interface CollectionItem extends CollectionItemRef {
  name: StringKey;
  theme: CollectionTheme;
  /** Placeholder look: main colour and trim colour. */
  colors: { base: string; accent: string };
}

const item = (
  id: string,
  type: CollectionItem['type'],
  tier: ItemTier | null,
  theme: CollectionTheme,
  name: StringKey,
  base: string,
  accent: string,
): CollectionItem => ({ id, type, tier, theme, name, colors: { base, accent } });

export const COLLECTION: readonly CollectionItem[] = [
  item(
    DEFAULT_CARD_BACK_ID,
    'cardBack',
    null,
    'default',
    'collection.cardBackDefault',
    '#7A1F2B',
    '#D4A94F',
  ),
  item(
    DEFAULT_TABLE_ID,
    'tableColour',
    null,
    'default',
    'collection.tableDefault',
    '#2A1238',
    '#4B2A6B',
  ),
  item('cardBack.red1', 'cardBack', 1, 'red', 'collection.cardBackRed1', '#9B1B30', '#F6D98B'),
  item('table.red2', 'tableColour', 2, 'red', 'collection.tableRed2', '#4A0F1A', '#9B1B30'),
  item('cardBack.red3', 'cardBack', 3, 'red', 'collection.cardBackRed3', '#C2185B', '#F6D98B'),
  item(
    'cardBack.purple1',
    'cardBack',
    1,
    'purple',
    'collection.cardBackPurple1',
    '#4B2A6B',
    '#F6D98B',
  ),
  item(
    'table.purple2',
    'tableColour',
    2,
    'purple',
    'collection.tablePurple2',
    '#33184A',
    '#6B3F94',
  ),
  item(
    'cardBack.purple3',
    'cardBack',
    3,
    'purple',
    'collection.cardBackPurple3',
    '#6B3F94',
    '#F6D98B',
  ),
  item('cardBack.gold1', 'cardBack', 1, 'gold', 'collection.cardBackGold1', '#B8862E', '#FFF8E7'),
  item('table.gold2', 'tableColour', 2, 'gold', 'collection.tableGold2', '#3D2A10', '#D4A94F'),
  item('cardBack.gold3', 'cardBack', 3, 'gold', 'collection.cardBackGold3', '#D4A94F', '#7A1F2B'),
];

export const ITEMS_FOR_SALE = COLLECTION.filter((i) => i.tier !== null);

export function findItem(id: string): CollectionItem | undefined {
  return COLLECTION.find((i) => i.id === id);
}
