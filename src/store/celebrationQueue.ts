/**
 * The celebration queue (R18.3, design section 9). Pure so the ordering is unit-tested.
 * Celebrations are presentation only: every reward is saved before an event is queued (G9).
 */
import type { PlayerRank } from '@/domain/progression/types';
import type { MotionLevel } from '@/domain/shared/motionLevel';
import type { TaskId } from '@/domain/tasks/definitions';

/** Ace's poses (R14.2). Only one artwork exists for now; every pose shows it. */
export type MascotPose = 'waving' | 'cheering' | 'thinking' | 'sleeping';

export type CelebrationEvent =
  | {
      kind: 'taskComplete';
      taskId: TaskId;
      tickets: number;
      stars: number;
      /** Exercise sessions say "Session complete". */
      headline?: 'taskCompleted' | 'sessionComplete';
    }
  | { kind: 'rankUp'; rank: PlayerRank; level: number; rankUp: boolean }
  | { kind: 'royalFlush'; tickets: number; stars: number; mysteryId: string }
  | { kind: 'mysteryReveal'; pendingId: string }
  | { kind: 'win'; stars: number }
  | { kind: 'aceMessage'; message: string; pose: MascotPose; stars?: number };

export interface QueuedCelebration {
  id: number;
  event: CelebrationEvent;
  /** Debug gallery only: preview at a fixed motion level. */
  motionOverride?: MotionLevel;
}

/** Shown one at a time in this order: task complete (and win), rank-up, Royal Flush, mystery. */
export const CELEBRATION_PRIORITY: Record<CelebrationEvent['kind'], number> = {
  taskComplete: 0,
  win: 0,
  rankUp: 1,
  royalFlush: 2,
  mysteryReveal: 3,
  aceMessage: 4,
};

const isAceMessage = (q: QueuedCelebration) => q.event.kind === 'aceMessage';

function insertSorted(waiting: QueuedCelebration[], item: QueuedCelebration): QueuedCelebration[] {
  const p = CELEBRATION_PRIORITY[item.event.kind];
  const index = waiting.findIndex((q) => CELEBRATION_PRIORITY[q.event.kind] > p);
  return index === -1
    ? [...waiting, item]
    : [...waiting.slice(0, index), item, ...waiting.slice(index)];
}

/**
 * Adds events. The one on screen (the head) stays put; the waiting ones are kept in priority
 * order, first come first within a priority. An Ace message is only ever shown alone: it is
 * dropped if a celebration is queued, a newer one replaces a waiting one, and a celebration
 * removes any Ace message still waiting.
 */
export function enqueue(
  queue: readonly QueuedCelebration[],
  items: readonly QueuedCelebration[],
): QueuedCelebration[] {
  let result = [...queue];
  for (const item of items) {
    const [head, ...rest] = result;
    if (!head) {
      result = [item];
    } else if (isAceMessage(item)) {
      if (!result.every(isAceMessage)) continue;
      result = [head, item];
    } else {
      result = [
        head,
        ...insertSorted(
          rest.filter((q) => !isAceMessage(q)),
          item,
        ),
      ];
    }
  }
  return result;
}

/** Removes the celebration on screen ("Collect"). */
export function dequeue(queue: readonly QueuedCelebration[]): QueuedCelebration[] {
  return queue.slice(1);
}
