import { create } from 'zustand';

export interface ScreenRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type RewardTarget = 'tickets' | 'stars';

interface RewardTargetsStore {
  targets: Partial<Record<RewardTarget, ScreenRect>>;
}

/**
 * Where the ticket and star counters are on screen (design section 9), so the task-complete
 * celebration can fly the reward to them. Counters register their window position on layout.
 */
export const useRewardTargets = create<RewardTargetsStore>()(() => ({ targets: {} }));

export function registerRewardTarget(target: RewardTarget, rect: ScreenRect | null) {
  useRewardTargets.setState((s) => {
    const targets = { ...s.targets };
    if (rect) targets[target] = rect;
    else delete targets[target];
    return { targets };
  });
}
