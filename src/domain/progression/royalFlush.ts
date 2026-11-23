import { TASK_IDS, type TaskId } from '../tasks/definitions';

/** All 4 tasks played today, and the bonus not yet claimed today (R16.1, R16.3). */
export function isRoyalFlushEligible(input: {
  playedToday: readonly TaskId[];
  claimedOn: string | null;
  today: string;
}): boolean {
  const played = new Set(input.playedToday);
  return TASK_IDS.every((id) => played.has(id)) && input.claimedOn !== input.today;
}

/** The Royal Flush was earned today but its celebration has not been shown yet (R16.4). */
export function isRoyalFlushUnseen(input: {
  claimedOn: string | null;
  seenOn: string | null;
  today: string;
}): boolean {
  return input.claimedOn === input.today && input.seenOn !== input.today;
}
