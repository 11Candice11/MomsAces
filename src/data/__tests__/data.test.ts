import { ECONOMY } from '@/domain/rewards/economy';
import { getString } from '@/strings';
import { COLLECTION, ITEMS_FOR_SALE } from '../collection';
import { MEDALS } from '../medals';
import { PRIZE_TABLE } from '../prizes';

describe('collection', () => {
  it('has 9 items for sale, 3 per theme: card back (1), table colour (2), card back (3)', () => {
    expect(ITEMS_FOR_SALE).toHaveLength(9);
    for (const theme of ['red', 'purple', 'gold'] as const) {
      const items = ITEMS_FOR_SALE.filter((i) => i.theme === theme).map((i) => [i.type, i.tier]);
      expect(items).toEqual([
        ['cardBack', 1],
        ['tableColour', 2],
        ['cardBack', 3],
      ]);
    }
  });

  it('has unique ids, a free default card back and table, and real names', () => {
    expect(new Set(COLLECTION.map((i) => i.id)).size).toBe(COLLECTION.length);
    expect(
      COLLECTION.filter((i) => i.tier === null)
        .map((i) => i.type)
        .sort(),
    ).toEqual(['cardBack', 'tableColour']);
    COLLECTION.forEach((i) => expect(getString(i.name)).toEqual(expect.any(String)));
  });

  it('the cheapest item costs the minimum price', () => {
    const prices = ITEMS_FOR_SALE.map((i) => ECONOMY.itemPrices[i.tier!]);
    expect(Math.min(...prices)).toBe(ECONOMY.itemPrices[1]);
  });
});

describe('prize table', () => {
  it('contains one entry per item for sale and the economy amounts', () => {
    expect(PRIZE_TABLE.filter((e) => e.type === 'item')).toHaveLength(9);
    expect(PRIZE_TABLE.filter((e) => e.type === 'stars').map((e) => e.amount)).toEqual(
      ECONOMY.mysteryPrize.stars.map((s) => s.amount),
    );
  });
});

describe('medals', () => {
  it('every medal has a name and description string', () => {
    expect(MEDALS).toHaveLength(7);
    MEDALS.forEach((m) => {
      expect(typeof getString(m.name)).toBe('string');
      expect(typeof getString(m.description)).toBe('string');
    });
  });
});
