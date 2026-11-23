import { create } from 'zustand';
import type { MotionLevel } from '@/domain/shared/motionLevel';
import {
  dequeue,
  enqueue,
  type CelebrationEvent,
  type QueuedCelebration,
} from './celebrationQueue';

interface CelebrationStore {
  /** The head is on screen; the rest wait their turn. Not persisted (presentation only). */
  queue: QueuedCelebration[];
}

/** In memory only. Rewards are saved in the persisted stores before anything is queued (G9). */
export const useCelebrationStore = create<CelebrationStore>()(() => ({ queue: [] }));

let nextId = 1;

/** Queues one or more celebrations. Screens call this; `CelebrationHost` shows them. */
export function celebrate(
  events: CelebrationEvent | CelebrationEvent[],
  options?: { motionOverride?: MotionLevel },
) {
  const list = Array.isArray(events) ? events : [events];
  const items = list.map((event) => ({
    id: nextId++,
    event,
    motionOverride: options?.motionOverride,
  }));
  useCelebrationStore.setState((s) => ({ queue: enqueue(s.queue, items) }));
}

/** "Collect" / "OK": closes the celebration on screen and shows the next one. */
export function dismissCelebration() {
  useCelebrationStore.setState((s) => ({ queue: dequeue(s.queue) }));
}
