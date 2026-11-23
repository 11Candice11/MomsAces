import { createPendingMystery } from '../../rewards/prizes';
import { pathNodes } from '../path';
import {
  advance,
  didRankUp,
  milestonesCrossed,
  newRanksReached,
  PATH_CONFIG,
  rankFromPosition,
  rankStartStep,
} from '../rank';
import { isRoyalFlushEligible, isRoyalFlushUnseen } from '../royalFlush';
import { daysThisWeek, lightDay, litDays, rollWeek } from '../week';

describe('advance', () => {
  it('only ever moves forward', () => {
    expect(advance(5, 1)).toBe(6);
    expect(advance(5, 0)).toBe(5);
    expect(advance(5, -3)).toBe(5);
  });
});

describe('rankFromPosition', () => {
  it.each([
    [0, 'jack', 1, 0],
    [19, 'jack', 1, 19],
    [20, 'jack', 2, 0],
    [99, 'jack', 5, 19],
    [100, 'queen', 1, 0],
    [200, 'king', 1, 0],
    [300, 'ace', 1, 0],
    [399, 'ace', 5, 19],
    [400, 'ace', 6, 0],
  ])('step %i is %s %i (+%i)', (step, rank, level, progress) => {
    expect(rankFromPosition(step)).toEqual({ rank, level, progressInLevel: progress });
  });

  it('uses 20 steps per level and 5 levels per rank', () => {
    expect(PATH_CONFIG).toEqual({ stepsPerLevel: 20, levelsPerRank: 5, milestoneEvery: 10 });
    expect([rankStartStep('queen'), rankStartStep('king'), rankStartStep('ace')]).toEqual([
      100, 200, 300,
    ]);
  });
});

describe('didRankUp', () => {
  it('detects new ranks and new levels', () => {
    expect(didRankUp(99, 100)).toEqual({ rankUp: true, levelUp: false, rank: 'queen', level: 1 });
    expect(didRankUp(19, 20)).toEqual({ rankUp: false, levelUp: true, rank: 'jack', level: 2 });
    expect(didRankUp(20, 21)).toEqual({ rankUp: false, levelUp: false, rank: 'jack', level: 2 });
  });
});

describe('milestones and new ranks', () => {
  it('gives each milestone chest once', () => {
    expect(milestonesCrossed(8, 11, [])).toEqual([10]);
    expect(milestonesCrossed(8, 11, [10])).toEqual([]);
    expect(milestonesCrossed(9, 31, [])).toEqual([10, 20, 30]);
    expect(milestonesCrossed(10, 10, [])).toEqual([]);
  });

  it('gives a new-rank card at steps 100, 200 and 300 only, never for a level', () => {
    expect(newRanksReached(99, 100, [])).toEqual(['queen']);
    expect(newRanksReached(199, 200, [])).toEqual(['king']);
    expect(newRanksReached(299, 301, [])).toEqual(['ace']);
    expect(newRanksReached(19, 20, [])).toEqual([]);
    expect(newRanksReached(399, 400, [])).toEqual([]);
    expect(newRanksReached(99, 100, ['queen'])).toEqual([]);
  });

  it('gives two mystery cards (chest and new rank) at each of steps 100, 200 and 300', () => {
    for (const step of [100, 200, 300]) {
      const cards =
        milestonesCrossed(step - 1, step, []).length + newRanksReached(step - 1, step, []).length;
      expect(cards).toBe(2);
    }
  });
});

describe('pathNodes', () => {
  const nodes = pathNodes(25, 0, []);
  const at = (step: number) => nodes.find((n) => n.step === step)!;

  it('has the right node kinds', () => {
    expect(at(0)).toMatchObject({ kind: 'start', rank: 'jack', level: 1, hasChest: false });
    expect(at(10)).toMatchObject({ kind: 'chest', hasChest: true });
    expect(at(20)).toMatchObject({ kind: 'level', rank: 'jack', level: 2 });
    expect(at(100)).toMatchObject({ kind: 'rank', rank: 'queen', level: 1 });
    expect(at(300)).toMatchObject({ kind: 'rank', rank: 'ace' });
    expect(at(400)).toMatchObject({ kind: 'level', rank: 'ace', level: 6 });
  });

  it('marks reached nodes and draws at least 400 steps', () => {
    expect(at(20).reached).toBe(true);
    expect(at(30).reached).toBe(false);
    expect(nodes[nodes.length - 1].step).toBe(400);
    expect(pathNodes(450, 20, []).at(-1)!.step).toBe(470);
  });

  it('shows a chest as ready only while a card for that step waits', () => {
    const waiting = [
      createPendingMystery('milestone', 1, 1, 10),
      createPendingMystery('rankUp', 2, 1, 100),
      createPendingMystery('royalFlush', 3, 1),
    ];
    const n = pathNodes(120, 0, waiting);
    expect(n.filter((x) => x.chestReady).map((x) => x.step)).toEqual([10, 100]);
  });
});

describe('Royal Flush', () => {
  const all = ['water', 'bathroom', 'stretch', 'stand'] as const;

  it('is eligible only with all 4 played and once per day', () => {
    expect(isRoyalFlushEligible({ playedToday: all, claimedOn: null, today: '2026-11-23' })).toBe(
      true,
    );
    expect(
      isRoyalFlushEligible({ playedToday: all.slice(0, 3), claimedOn: null, today: '2026-11-23' }),
    ).toBe(false);
    expect(
      isRoyalFlushEligible({ playedToday: all, claimedOn: '2026-11-23', today: '2026-11-23' }),
    ).toBe(false);
    expect(
      isRoyalFlushEligible({ playedToday: all, claimedOn: '2026-11-22', today: '2026-11-23' }),
    ).toBe(true);
    expect(
      isRoyalFlushEligible({ playedToday: [], claimedOn: '2026-11-22', today: '2026-11-23' }),
    ).toBe(false);
  });

  it('knows when the celebration is still to show', () => {
    expect(isRoyalFlushUnseen({ claimedOn: '2026-11-23', seenOn: null, today: '2026-11-23' })).toBe(
      true,
    );
    expect(
      isRoyalFlushUnseen({ claimedOn: '2026-11-23', seenOn: '2026-11-23', today: '2026-11-23' }),
    ).toBe(false);
  });
});

describe('days this week', () => {
  const week = { weekId: '2026-11-23', litDays: [] as string[] };

  it('lights each day once', () => {
    const w = lightDay(lightDay(lightDay(week, '2026-11-23'), '2026-11-23'), '2026-11-25');
    expect(w.litDays).toEqual(['2026-11-23', '2026-11-25']);
    expect(daysThisWeek(w, '2026-11-26')).toBe(2);
  });

  it('resets silently on a new week and is never negative', () => {
    const w = lightDay(week, '2026-11-23');
    expect(rollWeek(w, '2026-11-30')).toEqual({ weekId: '2026-11-30', litDays: [] });
    expect(daysThisWeek(w, '2026-12-01')).toBe(0);
    expect(lightDay(w, '2026-11-30')).toEqual({ weekId: '2026-11-30', litDays: ['2026-11-30'] });
  });

  it('finds lit days in archived records', () => {
    const days = {
      '2026-11-22': { date: '2026-11-22', completed: ['water' as const], ticketsEarned: 1 },
      '2026-11-24': { date: '2026-11-24', completed: ['water' as const], ticketsEarned: 1 },
      '2026-11-25': { date: '2026-11-25', completed: [], ticketsEarned: 0 },
    };
    expect(litDays(days, '2026-11-23')).toEqual(['2026-11-24']);
  });
});
