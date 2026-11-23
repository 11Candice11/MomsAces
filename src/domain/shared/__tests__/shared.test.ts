import { addDays, atLocalTime, isDateKey, localDateKey, mondayOf, startOfDateKey } from '../dates';
import { normalizeDisplayName } from '../displayName';
import { formatTime } from '../formatTime';
import { deriveSeed, mulberry32 } from '../rng';

describe('formatTime', () => {
  it.each([
    ['00:00', '12:00 AM', '00:00'],
    ['00:05', '12:05 AM', '00:05'],
    ['09:00', '9:00 AM', '09:00'],
    ['11:59', '11:59 AM', '11:59'],
    ['12:00', '12:00 PM', '12:00'],
    ['13:07', '1:07 PM', '13:07'],
    ['23:30', '11:30 PM', '23:30'],
  ])('%s -> %s (12h) and %s (24h)', (time, h12, h24) => {
    expect(formatTime(time, '12h')).toBe(h12);
    expect(formatTime(time, '24h')).toBe(h24);
  });

  it('returns invalid input unchanged', () => {
    expect(formatTime('25:00', '12h')).toBe('25:00');
    expect(formatTime('9:00', '24h')).toBe('9:00');
  });
});

describe('dates', () => {
  it('round-trips local dates', () => {
    const t = atLocalTime('2026-11-23', '15:30');
    expect(localDateKey(t)).toBe('2026-11-23');
    expect(startOfDateKey('2026-11-23')).toBe(atLocalTime('2026-11-23', '00:00'));
  });

  it('validates date keys', () => {
    expect(isDateKey('2026-11-23')).toBe(true);
    expect(isDateKey('2026-02-30')).toBe(false);
    expect(isDateKey('23/11/2026')).toBe(false);
    expect(isDateKey(5)).toBe(false);
  });

  it('adds days across month and year ends', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('finds the Monday of a week', () => {
    expect(mondayOf('2026-11-23')).toBe('2026-11-23'); // Monday
    expect(mondayOf('2026-11-29')).toBe('2026-11-23'); // Sunday
    expect(mondayOf('2026-11-30')).toBe('2026-11-30');
  });
});

describe('rng', () => {
  it('is deterministic per seed and differs between seeds', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const c = mulberry32(43);
    const seqA = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(seqA);
    expect([c(), c(), c()]).not.toEqual(seqA);
    seqA.forEach((v) => expect(v).toBeGreaterThanOrEqual(0));
    seqA.forEach((v) => expect(v).toBeLessThan(1));
  });

  it('derives different seeds for different indexes', () => {
    const seeds = new Set([0, 1, 2, 3, 4].map((i) => deriveSeed(1_700_000_000_000, i)));
    expect(seeds.size).toBe(5);
  });
});

describe('normalizeDisplayName', () => {
  it('trims, limits to 20 characters and falls back', () => {
    expect(normalizeDisplayName('  Ann ', 'Mom')).toBe('Ann');
    expect(normalizeDisplayName('x'.repeat(25), 'Mom')).toBe('x'.repeat(20));
    expect(normalizeDisplayName('', 'Mom')).toBe('Mom');
    expect(normalizeDisplayName(undefined, 'Mom')).toBe('Mom');
  });
});
