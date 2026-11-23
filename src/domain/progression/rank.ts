import { PLAYER_RANKS, type NewRank, type PlayerRank } from './types';

/** Path geometry only. Steps earned per card and per Royal Flush are in economy.ts. */
export const PATH_CONFIG = { stepsPerLevel: 20, levelsPerRank: 5, milestoneEvery: 10 } as const;

export const STEPS_PER_RANK = PATH_CONFIG.stepsPerLevel * PATH_CONFIG.levelsPerRank;

const NEW_RANKS: readonly NewRank[] = ['queen', 'king', 'ace'];

export interface RankPosition {
  rank: PlayerRank;
  /** 1-based. Ace levels keep counting past 5. */
  level: number;
  /** Steps into the current level (0 to stepsPerLevel - 1). */
  progressInLevel: number;
}

/** Moves the token forward. It never moves back (R15.6). */
export function advance(pathPosition: number, steps: number): number {
  return Math.max(0, Math.floor(pathPosition)) + Math.max(0, Math.floor(steps));
}

export function rankFromPosition(position: number): RankPosition {
  const p = Math.max(0, Math.floor(position));
  const rankIndex = Math.min(Math.floor(p / STEPS_PER_RANK), PLAYER_RANKS.length - 1);
  const intoRank = p - rankIndex * STEPS_PER_RANK;
  return {
    rank: PLAYER_RANKS[rankIndex],
    level: Math.floor(intoRank / PATH_CONFIG.stepsPerLevel) + 1,
    progressInLevel: intoRank % PATH_CONFIG.stepsPerLevel,
  };
}

/** The path step at which a rank starts (Jack 0, Queen 100, King 200, Ace 300). */
export function rankStartStep(rank: PlayerRank): number {
  return PLAYER_RANKS.indexOf(rank) * STEPS_PER_RANK;
}

export interface RankChange {
  rankUp: boolean;
  levelUp: boolean;
  rank: PlayerRank;
  level: number;
}

/** Drives the rank-up celebration: a new rank, or a new level within the same rank. */
export function didRankUp(before: number, after: number): RankChange {
  const a = rankFromPosition(before);
  const b = rankFromPosition(after);
  const rankUp = b.rank !== a.rank;
  return { rankUp, levelUp: !rankUp && b.level > a.level, rank: b.rank, level: b.level };
}

/** Milestone chest steps newly passed (one every 10 steps), not already claimed. */
export function milestonesCrossed(
  before: number,
  after: number,
  alreadyClaimed: readonly number[],
): number[] {
  const every = PATH_CONFIG.milestoneEvery;
  const result: number[] = [];
  for (let step = (Math.floor(before / every) + 1) * every; step <= after; step += every) {
    if (step > 0 && !alreadyClaimed.includes(step)) result.push(step);
  }
  return result;
}

/** Queen, King and Ace newly reached (not each level), not already claimed. */
export function newRanksReached(
  before: number,
  after: number,
  alreadyClaimed: readonly NewRank[],
): NewRank[] {
  return NEW_RANKS.filter((rank) => {
    const step = rankStartStep(rank);
    return before < step && step <= after && !alreadyClaimed.includes(rank);
  });
}
