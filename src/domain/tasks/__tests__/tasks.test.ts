import type { DayRecord } from '../../progression/types';
import { ECONOMY } from '../../rewards/economy';
import { atLocalTime } from '../../shared/dates';
import { addExtraWater, completeTask, resolveDone, snoozeTask } from '../completion';
import { freshHand } from '../day';
import { defaultReminderTimes, HAND_ORDER, type TaskId } from '../definitions';
import { aceMood, handState, nextFocus } from '../hand';
import { rollDay } from '../rollover';
import { clampStandCountdown, STAND_COUNTDOWN } from '../standCountdown';
import type { TodayHand } from '../types';

const DATE = '2026-11-23';
const at = (time: string) => atLocalTime(DATE, time);
const times = defaultReminderTimes();

function played(...ids: TaskId[]): TodayHand {
  let hand = freshHand(DATE);
  for (const id of ids) hand = completeTask(hand, id, at('08:00')).today;
  return hand;
}

describe('handState', () => {
  it('shows every card pending with its earliest reminder time', () => {
    const h = handState(freshHand(DATE), times, at('08:00'));
    expect(h.cards.map((c) => [c.taskId, c.dueTime, c.isDue])).toEqual([
      ['water', '09:00', false],
      ['bathroom', '11:00', false],
      ['stretch', '10:00', false],
      ['stand', '15:00', false],
    ]);
    expect(h.playedCount).toBe(0);
  });

  it('picks the earliest pending card when none is due yet', () => {
    expect(handState(freshHand(DATE), times, at('08:00')).next).toBe('water');
  });

  it('picks the earliest due card when several are due', () => {
    expect(handState(played('water'), times, at('16:00')).next).toBe('stretch');
  });

  it('moves a snoozed card later', () => {
    const hand = snoozeTask(freshHand(DATE), 'water', at('09:05'));
    const h = handState(hand, times, at('09:06'));
    expect(h.cards[0]).toMatchObject({ taskId: 'water', dueTime: '09:15', isDue: false });
    expect(h.next).toBe('water'); // still the earliest pending card overall
    // At 10:01 both are due: water (09:15) is earlier than stretch (10:00).
    expect(handState(hand, times, at('10:01')).next).toBe('water');
    // Snoozed again past stretch: stretch becomes the earliest due card.
    const again = snoozeTask(hand, 'water', at('10:01'));
    expect(handState(again, times, at('10:02')).next).toBe('stretch');
  });

  it('returns null next only when all 4 are played', () => {
    const h = handState(played(...HAND_ORDER), times, at('18:00'));
    expect(h.next).toBeNull();
    expect(h.playedCount).toBe(4);
  });

  it('never makes a played card next, due, or the focus', () => {
    for (const id of HAND_ORDER) {
      const h = handState(played(id), times, at('23:00'), id);
      expect(h.next).not.toBe(id);
      expect(h.cards.find((c) => c.taskId === id)).toMatchObject({ state: 'played', isDue: false });
    }
  });

  it('uses the focus card as next while it is pending', () => {
    expect(handState(freshHand(DATE), times, at('12:30'), 'stand').next).toBe('stand');
  });

  it('breaks ties in water, stretch, bathroom, stand order', () => {
    const same = {
      ...times,
      water: ['10:00'],
      stretch: ['10:00'],
      bathroom: ['10:00'],
      stand: ['10:00'],
    };
    expect(handState(freshHand(DATE), same, at('11:00')).next).toBe('water');
    expect(handState(played('water'), same, at('11:00')).next).toBe('stretch');
  });
});

describe('aceMood', () => {
  it('sleeps before the first reminder while nothing is due', () => {
    const hand = freshHand(DATE);
    expect(aceMood(handState(hand, times, at('07:00')), times, DATE, at('07:00'))).toBe('sleeping');
    expect(aceMood(handState(hand, times, at('09:00')), times, DATE, at('09:00'))).toBe('awake');
  });

  it('waves when all 4 are played', () => {
    const hand = played(...HAND_ORDER);
    expect(aceMood(handState(hand, times, at('08:00')), times, DATE, at('08:00'))).toBe(
      'allPlayed',
    );
  });
});

describe('nextFocus', () => {
  it('clears on any play and on snoozing the focus card only', () => {
    expect(nextFocus('stand', { type: 'play', taskId: 'water' })).toBeNull();
    expect(nextFocus('stand', { type: 'snooze', taskId: 'water' })).toBe('stand');
    expect(nextFocus('stand', { type: 'snooze', taskId: 'stand' })).toBeNull();
    expect(nextFocus(null, { type: 'snooze', taskId: 'stand' })).toBeNull();
  });
});

describe('resolveDone', () => {
  it('plays Water and Bathroom at once with the task-card reward', () => {
    for (const id of ['water', 'bathroom'] as const) {
      for (const source of ['home', 'notification'] as const) {
        expect(resolveDone(freshHand(DATE), id, source)).toEqual({
          kind: 'played',
          taskId: id,
          reward: { ...ECONOMY.taskCard },
        });
      }
    }
  });

  it('never completes Stretch or Stand: Home opens the flow, a notification guides', () => {
    expect(resolveDone(freshHand(DATE), 'stretch', 'home')).toEqual({
      kind: 'openFlow',
      taskId: 'stretch',
      flow: 'exercise',
    });
    expect(resolveDone(freshHand(DATE), 'stand', 'home')).toEqual({
      kind: 'openFlow',
      taskId: 'stand',
      flow: 'stand',
    });
    expect(resolveDone(freshHand(DATE), 'stand', 'notification')).toEqual({
      kind: 'guide',
      taskId: 'stand',
    });
  });

  it('gives extra Water stars only for a Water notification, up to the cap', () => {
    let hand = played('water');
    const max = ECONOMY.extraWater.maxPerDay;
    for (let i = 0; i < max; i++) {
      const r = resolveDone(hand, 'water', 'notification');
      expect(r).toEqual({
        kind: 'extraWater',
        stars: ECONOMY.extraWater.stars,
        remainingToday: max - i - 1,
      });
      hand = addExtraWater(hand);
    }
    expect(resolveDone(hand, 'water', 'notification')).toEqual({
      kind: 'repeat',
      taskId: 'water',
      message: 'waterEnough',
    });
    expect(addExtraWater(hand)).toBe(hand);
  });

  it('never gives extra stars for a Home tap', () => {
    expect(resolveDone(played('water'), 'water', 'home')).toEqual({
      kind: 'repeat',
      taskId: 'water',
      message: 'alreadyPlayed',
    });
  });

  it('answers every other repeat with a message and no reward', () => {
    for (const id of ['bathroom', 'stretch', 'stand'] as const) {
      for (const source of ['home', 'notification'] as const) {
        const r = resolveDone(played(id), id, source);
        expect(r).toEqual({ kind: 'repeat', taskId: id, message: 'alreadyPlayed' });
        expect('reward' in r).toBe(false);
      }
    }
  });
});

describe('completeTask and snoozeTask', () => {
  it('plays a card once; a second play changes nothing and rewards nothing', () => {
    const first = completeTask(freshHand(DATE), 'water', at('09:01'));
    expect(first.reward).toEqual(ECONOMY.taskCard);
    expect(first.today.water).toMatchObject({ status: 'done', completedAt: at('09:01') });
    const second = completeTask(first.today, 'water', at('09:02'));
    expect(second.reward).toBeNull();
    expect(second.today).toBe(first.today);
  });

  it('does not snooze a played card', () => {
    const hand = played('water');
    expect(snoozeTask(hand, 'water', at('10:00'))).toBe(hand);
  });

  it('clears the snooze when a snoozed card is played', () => {
    const snoozed = snoozeTask(freshHand(DATE), 'bathroom', at('11:00'));
    const done = completeTask(snoozed, 'bathroom', at('11:20')).today.bathroom;
    expect(done.status).toBe('done');
    expect(done.snoozedUntil).toBeUndefined();
  });
});

describe('rollDay', () => {
  const base = {
    today: played('water', 'stand'),
    days: {
      '2026-01-01': { date: '2026-01-01', completed: ['water'], ticketsEarned: 1 },
    } as Record<string, DayRecord>,
    daysThisWeek: { weekId: '2026-11-23', litDays: ['2026-11-23'] },
    dailyRoyalFlushClaimedOn: null,
  };

  it('deals a fresh hand and archives the old one quietly', () => {
    const next = rollDay(base, '2026-11-24');
    expect(next.today).toEqual(freshHand('2026-11-24'));
    expect(next.days['2026-11-23']).toEqual({
      date: '2026-11-23',
      completed: ['water', 'stand'],
      ticketsEarned: 2 * ECONOMY.taskCard.tickets,
    });
    expect(next.daysThisWeek).toEqual(base.daysThisWeek); // same week
  });

  it('prunes days older than 90 days', () => {
    expect(rollDay(base, '2026-11-24').days['2026-01-01']).toBeUndefined();
  });

  it('resets the week silently on a new week', () => {
    expect(rollDay(base, '2026-11-30').daysThisWeek).toEqual({ weekId: '2026-11-30', litDays: [] });
  });

  it('does nothing on the same day', () => {
    expect(rollDay(base, '2026-11-23')).toBe(base);
  });
});

describe('clampStandCountdown', () => {
  it('clamps below, inside and above 15 to 60', () => {
    expect(clampStandCountdown(5)).toBe(STAND_COUNTDOWN.min);
    expect(clampStandCountdown(30)).toBe(30);
    expect(clampStandCountdown(90)).toBe(STAND_COUNTDOWN.max);
    expect(clampStandCountdown(Number.NaN)).toBe(STAND_COUNTDOWN.default);
    expect(STAND_COUNTDOWN).toMatchObject({ min: 15, max: 60, default: 30 });
  });
});
