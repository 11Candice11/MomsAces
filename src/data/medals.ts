/** Starter medals (R9.10). The earning rules are in src/domain/rewards/medals.ts. */
import { MEDAL_IDS, type MedalId } from '@/domain/rewards/medals';
import type { StringKey } from '@/strings';

export interface MedalDefinition {
  id: MedalId;
  name: StringKey;
  description: StringKey;
}

export const MEDALS: readonly MedalDefinition[] = MEDAL_IDS.map((id) => ({
  id,
  name: `medals.${id}Name` as StringKey,
  description: `medals.${id}Description` as StringKey,
}));
