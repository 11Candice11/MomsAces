/** The mystery prize table, built from economy.ts and the items for sale. No numbers here. */
import { buildPrizeTable } from '@/domain/rewards/prizes';
import { ITEMS_FOR_SALE } from './collection';

export const PRIZE_TABLE = buildPrizeTable(ITEMS_FOR_SALE);
