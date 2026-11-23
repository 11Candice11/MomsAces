import type { RewardsState } from './state';

export function awardStars<R extends RewardsState>(rewards: R, n: number): R {
  return { ...rewards, goldStars: rewards.goldStars + Math.max(0, Math.floor(n)) };
}
