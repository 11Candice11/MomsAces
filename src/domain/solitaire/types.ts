/** Solitaire types (design section 17). The engine itself is built in task 12. */
export type Suit = 'S' | 'H' | 'D' | 'C';
export type CardRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface Card {
  /** 0 to 51. */
  id: number;
  suit: Suit;
  rank: CardRank;
  faceUp: boolean;
}

export interface GameState {
  stock: Card[];
  waste: Card[];
  foundations: Record<Suit, Card[]>;
  /** 7 columns, bottom to top. */
  tableau: Card[][];
  moves: number;
  status: 'playing' | 'won';
}

export type SeedSource = 'verified' | 'random';
