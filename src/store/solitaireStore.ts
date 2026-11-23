import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistOptions } from './persistOptions';
import { defaultSolitaire, sanitizeSolitaire, type SolitaireData } from './sanitize';

/** The saved game and the verified seeds already played. Game actions come in task 12. */
export type SolitaireStore = SolitaireData;

const pickSolitaire = (s: SolitaireStore): SolitaireData => ({
  save: s.save,
  playedWinnableSeeds: s.playedWinnableSeeds,
});

export const useSolitaireStore = create<SolitaireStore>()(
  persist(
    () => defaultSolitaire(),
    persistOptions<SolitaireStore, SolitaireData>({
      store: 'solitaire',
      version: 1,
      pick: pickSolitaire,
      sanitize: sanitizeSolitaire,
    }),
  ),
);
