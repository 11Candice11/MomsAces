import { ECONOMY } from './economy';
import type { RewardsState } from './state';

const whole = (n: number) => Math.max(0, Math.floor(n));

export function awardTicket<R extends RewardsState>(rewards: R, n: number = 1): R {
  return { ...rewards, aceTickets: rewards.aceTickets + whole(n) };
}

/** Spends the cost of one game. Null if she does not have enough (never below 0, R3.4). */
export function spendTicket<R extends RewardsState>(
  rewards: R,
  cost: number = ECONOMY.costs.solitaireGameTickets,
): R | null {
  const c = whole(cost);
  if (rewards.aceTickets < c) return null;
  return { ...rewards, aceTickets: rewards.aceTickets - c };
}
