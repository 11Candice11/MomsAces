import { useMemo } from 'react';
import { localDateKey } from '@/domain/shared/dates';
import { daySeed, pickLine } from '@/domain/shared/pickLine';
import { useSettingsStore } from '@/store';
import { useNow } from '../useNow';

type NameLine = (name: string) => string;

/** What Ace calls her: `settings.displayName` (default "Mom"). */
export function useDisplayName(): string {
  return useSettingsStore((s) => s.displayName);
}

/** One line from a pool of Ace's lines, the same all day, with her name filled in. */
export function useAceLine(pool: readonly NameLine[]): string {
  const name = useDisplayName();
  const now = useNow(60_000);
  const seed = daySeed(localDateKey(now));
  return useMemo(() => pickLine(pool, seed)(name), [pool, seed, name]);
}
