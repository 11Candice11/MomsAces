import { startOfDateKey } from './dates';

/** Picks one entry from a pool by seed. Stable for a seed, so a line stays the same all day. */
export function pickLine<T>(lines: readonly T[], seed: number): T {
  if (lines.length === 0) throw new RangeError('pickLine: empty pool');
  const i = ((Math.floor(seed) % lines.length) + lines.length) % lines.length;
  return lines[i];
}

/** A whole number that changes once per local day: rotates Ace's lines day by day. */
export function daySeed(dateKey: string): number {
  return Math.round(startOfDateKey(dateKey) / 86_400_000);
}
