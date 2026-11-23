import type { PendingMystery } from '../rewards/types';
import { PATH_CONFIG, rankFromPosition, STEPS_PER_RANK } from './rank';
import type { PlayerRank } from './types';

export type PathNodeKind = 'start' | 'rank' | 'level' | 'chest';

export interface PathNode {
  step: number;
  kind: PathNodeKind;
  rank: PlayerRank;
  level: number;
  /** Every node after the start holds a milestone chest. */
  hasChest: boolean;
  reached: boolean;
  /** A mystery card for this step is waiting to be opened. */
  chestReady: boolean;
}

/** The last rank card is Ace, at step 300. After that, Ace levels continue. */
const LAST_RANK_STEP = 3 * STEPS_PER_RANK;
/** The board is always drawn at least to here. */
export const MIN_BOARD_STEPS = 4 * STEPS_PER_RANK;

/**
 * The whole board (design section 7): a node every 10 steps, a level node every 20, a rank card
 * every 100 (Queen, King, Ace), and the start (Jack 1) at 0. `chestReady` is true only while a
 * milestone or new-rank mystery card for that exact step is waiting (R15.11).
 */
export function pathNodes(
  position: number,
  aheadSteps: number,
  pending: readonly PendingMystery[],
): PathNode[] {
  const every = PATH_CONFIG.milestoneEvery;
  const last = Math.max(MIN_BOARD_STEPS, Math.ceil((position + aheadSteps) / every) * every);
  const readySteps = new Set(
    pending
      .filter(
        (p) => (p.source === 'milestone' || p.source === 'rankUp') && p.milestoneStep !== undefined,
      )
      .map((p) => p.milestoneStep),
  );
  const nodes: PathNode[] = [];
  for (let step = 0; step <= last; step += every) {
    const { rank, level } = rankFromPosition(step);
    const kind: PathNodeKind =
      step === 0
        ? 'start'
        : step % STEPS_PER_RANK === 0 && step <= LAST_RANK_STEP
          ? 'rank'
          : step % PATH_CONFIG.stepsPerLevel === 0
            ? 'level'
            : 'chest';
    nodes.push({
      step,
      kind,
      rank,
      level,
      hasChest: step > 0,
      reached: step <= position,
      chestReady: readySteps.has(step),
    });
  }
  return nodes;
}
