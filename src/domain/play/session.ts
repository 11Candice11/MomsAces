/**
 * Whole-game steps that touch progress and rewards together (design sections 6 to 8). Each step
 * is pure and returns the new state plus an outcome the UI turns into celebrations. The store
 * saves the new state first and only then queues celebrations (G9).
 */
import {
  advance,
  didRankUp,
  milestonesCrossed,
  newRanksReached,
  rankFromPosition,
  rankStartStep,
  type RankChange,
} from '../progression/rank';
import { isRoyalFlushEligible } from '../progression/royalFlush';
import type { ProgressState } from '../progression/state';
import type { NewRank } from '../progression/types';
import { lightDay } from '../progression/week';
import { ECONOMY } from '../rewards/economy';
import { evaluateMedals, type MedalId } from '../rewards/medals';
import { createPendingMystery } from '../rewards/prizes';
import { awardStars } from '../rewards/stars';
import type { RewardsState } from '../rewards/state';
import { awardTicket } from '../rewards/tickets';
import type { PendingMystery } from '../rewards/types';
import { deriveSeed } from '../shared/rng';
import { addExtraWater, completeTask, playedTasks, type TaskCardReward } from '../tasks/completion';
import type { TaskId } from '../tasks/definitions';
import { rollDay } from '../tasks/rollover';

export interface GameSnapshot {
  progress: ProgressState;
  rewards: RewardsState;
}

export interface PathOutcome {
  /** Set when a rank or level was reached (drives the rank-up celebration). */
  rankChange: RankChange | null;
  newRanks: NewRank[];
  /** Mystery cards created by milestone chests and new ranks, in step order. */
  newMysteries: PendingMystery[];
}

export interface TaskCardOutcome extends PathOutcome {
  taskId: TaskId;
  reward: TaskCardReward;
  /** Set when this card completed the hand and the Royal Flush was claimed. */
  royalFlush: { tickets: number; stars: number; pathSteps: number; mystery: PendingMystery } | null;
  newMedals: MedalId[];
}

/** Deals a new hand if the day has changed. Unchanged otherwise. */
export function ensureToday(snapshot: GameSnapshot, date: string): GameSnapshot {
  const progress = rollDay(snapshot.progress, date);
  return progress === snapshot.progress ? snapshot : { ...snapshot, progress };
}

/**
 * Moves the token and creates the mystery cards it earns: one per milestone chest passed and one
 * per new rank reached. Steps 100, 200 and 300 therefore give two cards each (R15.12).
 */
export function moveOnPath(
  snapshot: GameSnapshot,
  steps: number,
  now: number,
  seedOffset = 0,
): { snapshot: GameSnapshot; outcome: PathOutcome } {
  const { progress, rewards } = snapshot;
  const before = progress.pathPosition;
  const after = advance(before, steps);
  const milestones = milestonesCrossed(before, after, progress.claimedMilestones);
  const ranks = newRanksReached(before, after, progress.claimedRankUps);

  const created: { step: number; mystery: PendingMystery }[] = [];
  let seedIndex = seedOffset;
  for (const step of milestones) {
    for (let i = 0; i < ECONOMY.milestoneChest.mysteryCards; i++) {
      created.push({
        step,
        mystery: createPendingMystery('milestone', deriveSeed(now, seedIndex++), now, step),
      });
    }
  }
  for (const rank of ranks) {
    const step = rankStartStep(rank);
    for (let i = 0; i < ECONOMY.newRank.mysteryCards; i++) {
      created.push({
        step,
        mystery: createPendingMystery('rankUp', deriveSeed(now, seedIndex++), now, step),
      });
    }
  }
  const newMysteries = created.sort((a, b) => a.step - b.step).map((c) => c.mystery);

  const change = didRankUp(before, after);
  const position = rankFromPosition(after);
  return {
    snapshot: {
      progress: {
        ...progress,
        pathPosition: after,
        rank: position.rank,
        rankLevel: position.level,
        claimedMilestones: [...progress.claimedMilestones, ...milestones],
        claimedRankUps: [...progress.claimedRankUps, ...ranks],
      },
      rewards: {
        ...rewards,
        pendingMysteryRewards: [...rewards.pendingMysteryRewards, ...newMysteries],
      },
    },
    outcome: {
      rankChange: change.rankUp || change.levelUp ? change : null,
      newRanks: ranks,
      newMysteries,
    },
  };
}

function withNewMedals(
  snapshot: GameSnapshot,
  date: string,
): { snapshot: GameSnapshot; newMedals: MedalId[] } {
  const { progress, rewards } = snapshot;
  const newMedals = evaluateMedals({
    days: progress.days,
    today: { date, played: playedTasks(progress.today) },
    pathPosition: progress.pathPosition,
    dailyRoyalFlushClaimedOn: progress.dailyRoyalFlushClaimedOn,
    gamesWon: rewards.gamesWon,
    earned: progress.medals,
  });
  if (newMedals.length === 0) return { snapshot, newMedals };
  return {
    snapshot: {
      ...snapshot,
      progress: { ...progress, medals: [...progress.medals, ...newMedals] },
    },
    newMedals,
  };
}

/**
 * Plays a task card: the task-card reward, a lit day, the path step, and, if this was the 4th card
 * today, the Royal Flush (2 tickets, 20 stars, 2 path steps and one mystery card). Returns null if
 * the card was already played today (no repeat reward, R1.12).
 */
export function playTaskCard(
  snapshot: GameSnapshot,
  taskId: TaskId,
  now: number,
  date: string,
): { snapshot: GameSnapshot; outcome: TaskCardOutcome } | null {
  let snap = ensureToday(snapshot, date);
  const completed = completeTask(snap.progress.today, taskId, now);
  if (!completed.reward) return null;
  const reward = completed.reward;

  snap = {
    progress: {
      ...snap.progress,
      today: completed.today,
      daysThisWeek: lightDay(snap.progress.daysThisWeek, date),
    },
    rewards: awardStars(awardTicket(snap.rewards, reward.tickets), reward.stars),
  };

  let royalFlush: TaskCardOutcome['royalFlush'] = null;
  let steps = reward.pathSteps;
  if (
    isRoyalFlushEligible({
      playedToday: playedTasks(snap.progress.today),
      claimedOn: snap.progress.dailyRoyalFlushClaimedOn,
      today: date,
    })
  ) {
    const rf = ECONOMY.royalFlush;
    const mystery = createPendingMystery('royalFlush', deriveSeed(now, 1000), now);
    snap = {
      progress: { ...snap.progress, dailyRoyalFlushClaimedOn: date },
      rewards: {
        ...awardStars(awardTicket(snap.rewards, rf.tickets), rf.stars),
        pendingMysteryRewards: [...snap.rewards.pendingMysteryRewards, mystery],
      },
    };
    steps += rf.pathSteps;
    royalFlush = { tickets: rf.tickets, stars: rf.stars, pathSteps: rf.pathSteps, mystery };
  }

  const moved = moveOnPath(snap, steps, now);
  const medals = withNewMedals(moved.snapshot, date);
  return {
    snapshot: medals.snapshot,
    outcome: { taskId, reward, royalFlush, newMedals: medals.newMedals, ...moved.outcome },
  };
}

/** One extra Water star for a repeat "Done" on a Water notification (call after resolveDone). */
export function claimExtraWater(snapshot: GameSnapshot): GameSnapshot {
  const today = addExtraWater(snapshot.progress.today);
  if (today === snapshot.progress.today) return snapshot;
  return {
    progress: { ...snapshot.progress, today },
    rewards: awardStars(snapshot.rewards, ECONOMY.extraWater.stars),
  };
}

/** A Solitaire win (also "Finish for me"): the win stars, the win count and any new medals. */
export function awardWin(
  snapshot: GameSnapshot,
  date: string,
): { snapshot: GameSnapshot; stars: number; newMedals: MedalId[] } {
  const stars = ECONOMY.solitaireWin.stars;
  const won: GameSnapshot = {
    ...snapshot,
    rewards: { ...awardStars(snapshot.rewards, stars), gamesWon: snapshot.rewards.gamesWon + 1 },
  };
  const medals = withNewMedals(won, date);
  return { snapshot: medals.snapshot, stars, newMedals: medals.newMedals };
}
