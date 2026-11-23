/**
 * Seeded random numbers (mulberry32), shared by Solitaire deals and mystery prizes.
 * The same seed always gives the same sequence, so deals and prizes are reproducible.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Derives a well-mixed 32-bit seed from a time and an index (for several seeds in one moment). */
export function deriveSeed(base: number, index = 0): number {
  return (Math.imul((Math.floor(base) ^ (index * 0x9e3779b9)) >>> 0, 0x85ebca6b) ^ index) >>> 0;
}
