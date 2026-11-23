import type { ProgressState } from '../../progression/state';
import { ECONOMY } from '../../rewards/economy';
import type { RewardsState } from '../../rewards/state';
import { atLocalTime } from '../../shared/dates';
import { freshHand } from '../../tasks/day';
import {
  awardWin,
  claimExtraWater,
  ensureToday,
  moveOnPath,
  playTaskCard,
  type GameSnapshot,
} from '../session';

const DATE = '2026-11-23';
const NOW = atLocalTime(DATE, '09:30');

function snapshot(
  progress: Partial<ProgressState> = {},
  rewards: Partial<RewardsState> = {},
): GameSnapshot {
  return {
    progress: {
      days: {},
      today: freshHand(DATE),
      rank: 'jack',
      rankLevel: 1,
      pathPosition: 0,
      dailyRoyalFlushClaimedOn: null,
      royalFlushSeenOn: null,
      daysThisWeek: { weekId: DATE, litDays: [] },
      medals: [],
      claimedMilestones: [],
      claimedRankUps: [],
      ...progress,
    },
    rewards: {
      aceTickets: 0,
      goldStars: 0,
      unlockedItems: [],
      equippedCardBack: 'cardBack.default',
      equippedTable: 'table.default',
      gamesWon: 0,
      pendingMysteryRewards: [],
      lastRevealedPrize: null,
      newlyUnlockedItemIds: [],
      ...rewards,
    },
  };
}

describe('playTaskCard', () => {
  it('awards the task card, lights the day, moves one step and earns First Card Played', () => {
    const r = playTaskCard(snapshot(), 'water', NOW, DATE)!;
    expect(r.snapshot.rewards.aceTickets).toBe(ECONOMY.taskCard.tickets);
    expect(r.snapshot.rewards.goldStars).toBe(ECONOMY.taskCard.stars);
    expect(r.snapshot.progress.pathPosition).toBe(ECONOMY.taskCard.pathSteps);
    expect(r.snapshot.progress.today.water.status).toBe('done');
    expect(r.snapshot.progress.daysThisWeek.litDays).toEqual([DATE]);
    expect(r.outcome).toMatchObject({
      taskId: 'water',
      royalFlush: null,
      rankChange: null,
      newMedals: ['firstCard'],
    });
  });

  it('gives nothing for a second play of the same card', () => {
    const first = playTaskCard(snapshot(), 'water', NOW, DATE)!;
    expect(playTaskCard(first.snapshot, 'water', NOW + 1, DATE)).toBeNull();
  });

  it('claims the Royal Flush once on the 4th card', () => {
    let s = snapshot();
    for (const id of ['water', 'bathroom', 'stretch'] as const)
      s = playTaskCard(s, id, NOW, DATE)!.snapshot;
    const r = playTaskCard(s, 'stand', NOW, DATE)!;
    const rf = ECONOMY.royalFlush;
    expect(r.outcome.royalFlush).toMatchObject({
      tickets: rf.tickets,
      stars: rf.stars,
      pathSteps: rf.pathSteps,
    });
    expect(r.snapshot.progress.dailyRoyalFlushClaimedOn).toBe(DATE);
    expect(r.snapshot.rewards.aceTickets).toBe(4 * ECONOMY.taskCard.tickets + rf.tickets);
    expect(r.snapshot.rewards.goldStars).toBe(4 * ECONOMY.taskCard.stars + rf.stars);
    expect(r.snapshot.progress.pathPosition).toBe(4 * ECONOMY.taskCard.pathSteps + rf.pathSteps);
    expect(
      r.snapshot.rewards.pendingMysteryRewards.filter((p) => p.source === 'royalFlush'),
    ).toHaveLength(1);
    expect(r.outcome.newMedals).toContain('firstRoyalFlush');
  });

  it('deals a new hand first when the day changed', () => {
    const yesterday = snapshot({ today: freshHand('2026-11-22') });
    const r = playTaskCard(yesterday, 'water', NOW, DATE)!;
    expect(r.snapshot.progress.today.water.date).toBe(DATE);
    expect(ensureToday(r.snapshot, DATE)).toBe(r.snapshot);
  });
});

describe('moveOnPath', () => {
  it('creates a chest card at each milestone passed', () => {
    const r = moveOnPath(snapshot({ pathPosition: 9 }), 1, NOW);
    expect(r.outcome.newMysteries.map((m) => [m.source, m.milestoneStep])).toEqual([
      ['milestone', 10],
    ]);
    expect(r.snapshot.progress.claimedMilestones).toEqual([10]);
  });

  it.each([
    [100, 'queen'],
    [200, 'king'],
    [300, 'ace'],
  ] as const)('creates two mystery cards at step %i (chest and %s)', (step, rank) => {
    const r = moveOnPath(snapshot({ pathPosition: step - 1 }), 1, NOW);
    expect(r.outcome.newMysteries.map((m) => [m.source, m.milestoneStep])).toEqual([
      ['milestone', step],
      ['rankUp', step],
    ]);
    expect(new Set(r.outcome.newMysteries.map((m) => m.id)).size).toBe(2);
    expect(r.outcome.newRanks).toEqual([rank]);
    expect(r.outcome.rankChange).toMatchObject({ rankUp: true, rank, level: 1 });
    expect(r.snapshot.progress.rank).toBe(rank);
    expect(r.snapshot.rewards.pendingMysteryRewards).toHaveLength(2);
  });

  it('never grants the same chest or rank twice', () => {
    const once = moveOnPath(snapshot({ pathPosition: 99 }), 1, NOW).snapshot;
    const moved = moveOnPath(
      { ...once, progress: { ...once.progress, pathPosition: 99 } },
      1,
      NOW + 1,
    );
    expect(moved.outcome.newMysteries).toEqual([]);
  });

  it('reports a level up without a mystery card for the level', () => {
    const r = moveOnPath(snapshot({ pathPosition: 39 }), 1, NOW);
    expect(r.outcome.rankChange).toMatchObject({ rankUp: false, levelUp: true, level: 3 });
    expect(r.outcome.newRanks).toEqual([]);
  });
});

describe('extra water and wins', () => {
  it('adds one extra water star up to the cap', () => {
    let s = playTaskCard(snapshot(), 'water', NOW, DATE)!.snapshot;
    const before = s.rewards.goldStars;
    for (let i = 0; i < ECONOMY.extraWater.maxPerDay + 2; i++) s = claimExtraWater(s);
    expect(s.rewards.goldStars).toBe(
      before + ECONOMY.extraWater.maxPerDay * ECONOMY.extraWater.stars,
    );
    expect(s.rewards.aceTickets).toBe(ECONOMY.taskCard.tickets);
    expect(s.progress.pathPosition).toBe(ECONOMY.taskCard.pathSteps);
  });

  it('pays the win stars and earns First Win', () => {
    const r = awardWin(snapshot(), DATE);
    expect(r.snapshot.rewards.goldStars).toBe(ECONOMY.solitaireWin.stars);
    expect(r.snapshot.rewards.gamesWon).toBe(1);
    expect(r.newMedals).toEqual(['firstWin']);
  });
});
