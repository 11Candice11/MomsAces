import { DEFAULT_CARD_BACK_ID, DEFAULT_TABLE_ID } from '@/domain/rewards/types';
import { DEFAULT_REMINDER_TIMES } from '@/domain/tasks/definitions';
import { STAND_COUNTDOWN } from '@/domain/tasks/standCountdown';
import {
  defaultProgress,
  defaultRewards,
  defaultSettings,
  defaultSolitaire,
  sanitizeProgress,
  sanitizeRewards,
  sanitizeSettings,
  sanitizeSolitaire,
} from '../sanitize';

const TODAY = '2026-11-23'; // a Monday

describe.each([undefined, null, 42, 'garbage', [], true])('non-object stored value %p', (raw) => {
  it('gives the defaults for every store', () => {
    expect(sanitizeSettings(raw)).toEqual(defaultSettings());
    expect(sanitizeProgress(raw, TODAY)).toEqual(defaultProgress(TODAY));
    expect(sanitizeRewards(raw)).toEqual(defaultRewards());
    expect(sanitizeSolitaire(raw)).toEqual(defaultSolitaire());
  });
});

describe('sanitizeSettings', () => {
  it('keeps valid values', () => {
    const s = sanitizeSettings({
      ...defaultSettings(),
      soundOn: false,
      displayName: 'Margaret',
      textScale: 'xlarge',
      calmMode: true,
      standCountdownSec: 45,
      reminderTimes: { ...DEFAULT_REMINDER_TIMES, water: ['08:30'] },
    });
    expect(s).toMatchObject({
      soundOn: false,
      displayName: 'Margaret',
      textScale: 'xlarge',
      calmMode: true,
      standCountdownSec: 45,
    });
    expect(s.reminderTimes.water).toEqual(['08:30']);
  });

  it('replaces each bad field with its own default', () => {
    const s = sanitizeSettings({ soundOn: 'yes', textScale: 'huge', calmMode: true });
    expect(s.soundOn).toBe(true);
    expect(s.textScale).toBe('normal');
    expect(s.calmMode).toBe(true);
  });

  it('clamps the stand countdown and defaults non-numbers', () => {
    expect(sanitizeSettings({ standCountdownSec: 5 }).standCountdownSec).toBe(STAND_COUNTDOWN.min);
    expect(sanitizeSettings({ standCountdownSec: 600 }).standCountdownSec).toBe(
      STAND_COUNTDOWN.max,
    );
    expect(sanitizeSettings({ standCountdownSec: 'x' }).standCountdownSec).toBe(
      STAND_COUNTDOWN.default,
    );
  });

  it('trims the display name, limits it to 20 characters and falls back to Mom', () => {
    expect(sanitizeSettings({ displayName: '  Jo  ' }).displayName).toBe('Jo');
    expect(sanitizeSettings({ displayName: 'A'.repeat(30) }).displayName).toHaveLength(20);
    expect(sanitizeSettings({ displayName: '   ' }).displayName).toBe('Mom');
  });

  it('falls back per task for invalid reminder times', () => {
    const s = sanitizeSettings({
      reminderTimes: {
        water: ['25:00', 'noon'],
        stretch: ['10:30', '10:30'],
        bathroom: ['01:00', '02:00', '03:00', '04:00'],
        stand: ['14:00'],
      },
    });
    expect(s.reminderTimes.water).toEqual([...DEFAULT_REMINDER_TIMES.water]);
    expect(s.reminderTimes.stretch).toEqual(['10:30']);
    expect(s.reminderTimes.bathroom).toEqual([...DEFAULT_REMINDER_TIMES.bathroom]);
    expect(s.reminderTimes.stand).toEqual(['14:00']);
  });
});

describe('sanitizeProgress', () => {
  it('deals a fresh hand for today when the stored hand is unreadable', () => {
    const p = sanitizeProgress({ today: 'x', pathPosition: 12 }, TODAY);
    expect(p.today.water).toEqual({
      taskId: 'water',
      date: TODAY,
      status: 'pending',
      extraWaterStars: 0,
    });
    expect(p.pathPosition).toBe(12);
  });

  it('keeps a stored hand with its own date (rollover happens elsewhere)', () => {
    const stored = defaultProgress('2026-11-20');
    stored.today.water = { ...stored.today.water, status: 'done', completedAt: 1 };
    const p = sanitizeProgress(stored, TODAY);
    expect(p.today.water.status).toBe('done');
    expect(p.today.water.date).toBe('2026-11-20');
  });

  it('never keeps a done card without a completion time', () => {
    const stored = defaultProgress(TODAY);
    stored.today.bathroom = { ...stored.today.bathroom, status: 'done' };
    expect(sanitizeProgress(stored, TODAY).today.bathroom.status).toBe('pending');
  });

  it('rejects negative or fractional counters', () => {
    const p = sanitizeProgress({ pathPosition: -3, rankLevel: 0.5, rank: 'joker' }, TODAY);
    expect(p.pathPosition).toBe(0);
    expect(p.rankLevel).toBe(1);
    expect(p.rank).toBe('jack');
  });

  it('keeps only known new ranks and valid days', () => {
    const p = sanitizeProgress(
      {
        claimedRankUps: ['queen', 'jack', 'emperor', 'queen'],
        days: { '2026-11-20': { completed: ['water', 'nap'], ticketsEarned: 1 }, bad: {} },
      },
      TODAY,
    );
    expect(p.claimedRankUps).toEqual(['queen']);
    expect(Object.keys(p.days)).toEqual(['2026-11-20']);
    expect(p.days['2026-11-20'].completed).toEqual(['water']);
  });
});

describe('sanitizeRewards', () => {
  it('always keeps the default items unlocked and equipped items owned', () => {
    const r = sanitizeRewards({
      unlockedItems: ['cardBack.red1'],
      equippedCardBack: 'cardBack.gold3',
      equippedTable: 'table.default',
    });
    expect(r.unlockedItems).toEqual(
      expect.arrayContaining([DEFAULT_CARD_BACK_ID, DEFAULT_TABLE_ID, 'cardBack.red1']),
    );
    expect(r.equippedCardBack).toBe(DEFAULT_CARD_BACK_ID);
  });

  it('never allows negative balances', () => {
    const r = sanitizeRewards({ aceTickets: -1, goldStars: 2.5 });
    expect(r.aceTickets).toBe(0);
    expect(r.goldStars).toBe(0);
  });

  it('keeps valid pending mystery cards and drops broken or duplicate ones', () => {
    const r = sanitizeRewards({
      pendingMysteryRewards: [
        { id: 'a', source: 'royalFlush', seed: 7, createdAt: 1 },
        { id: 'a', source: 'royalFlush', seed: 8, createdAt: 2 },
        { id: 'b', source: 'lottery', seed: 1, createdAt: 1 },
        { id: 'c', source: 'milestone', seed: 3, createdAt: 1, milestoneStep: 10 },
        { id: 'd', source: 'rankUp' },
      ],
    });
    expect(r.pendingMysteryRewards).toEqual([
      { id: 'a', source: 'royalFlush', seed: 7, createdAt: 1 },
      { id: 'c', source: 'milestone', seed: 3, createdAt: 1, milestoneStep: 10 },
    ]);
  });
});

describe('sanitizeSolitaire', () => {
  it('drops a save with the wrong outline and keeps played seeds', () => {
    const s = sanitizeSolitaire({ save: { seed: 1 }, playedWinnableSeeds: [3, -1, 3, 9] });
    expect(s.save).toBeNull();
    expect(s.playedWinnableSeeds).toEqual([3, 9]);
  });
});
