/**
 * Default state and validation for every persisted store (task 2.3).
 *
 * Persisted data is untrusted: it may be from an older build, cut short, or hand-edited. Each
 * sanitizer takes whatever was stored and returns a complete, valid state. Anything that is not
 * an object gives the store's defaults; inside an object, each field that is missing or wrong
 * falls back to its own default, so one bad field never costs her the rest of her progress.
 * Pure (no React Native), so it is unit-tested.
 */
import { isDateKey, mondayOf } from '@/domain/shared/dates';
import { normalizeDisplayName } from '@/domain/shared/displayName';
import type { ProgressState } from '@/domain/progression/state';
import {
  PLAYER_RANKS,
  type DayRecord,
  type NewRank,
  type WeekState,
} from '@/domain/progression/types';
import type { RewardsState } from '@/domain/rewards/state';
import {
  DEFAULT_CARD_BACK_ID,
  DEFAULT_TABLE_ID,
  type MysterySource,
  type PendingMystery,
  type Prize,
} from '@/domain/rewards/types';
import type { GameState, SeedSource } from '@/domain/solitaire/types';
import { freshHand, freshTaskDay } from '@/domain/tasks/day';
import {
  defaultReminderTimes,
  HAND_ORDER,
  isTaskId,
  MAX_REMINDERS_PER_TASK,
  type ReminderTimes,
  type TaskId,
} from '@/domain/tasks/definitions';
import { clampStandCountdown, STAND_COUNTDOWN } from '@/domain/tasks/standCountdown';
import type { TaskDay, TaskStatus, TodayHand } from '@/domain/tasks/types';
import type { TextScaleName } from '@/theme/typography';
import { strings } from '@/strings';

// ---------- shapes ----------

export interface SettingsData {
  reminderTimes: ReminderTimes;
  soundOn: boolean;
  helperPhone: string;
  displayName: string;
  textScale: TextScaleName;
  standCountdownSec: number;
  calmMode: boolean;
  onboardingDone: boolean;
  permissionsExplained: boolean;
}

export type ProgressData = ProgressState;
export type RewardsData = RewardsState;

export interface SolitaireSave {
  seed: number;
  seedSource: SeedSource;
  state: GameState;
  past: GameState[];
  startedAt: number;
}

export interface SolitaireData {
  save: SolitaireSave | null;
  playedWinnableSeeds: number[];
}

// ---------- small validators ----------

type Rec = Record<string, unknown>;
const isRecord = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v);
const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
const str = (v: unknown, fallback: string) => (typeof v === 'string' ? v : fallback);
const count = (v: unknown, fallback = 0) =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0 ? v : fallback;
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const oneOf = <T extends string>(v: unknown, options: readonly T[], fallback: T): T =>
  typeof v === 'string' && (options as readonly string[]).includes(v) ? (v as T) : fallback;
const dateOrNull = (v: unknown) => (isDateKey(v) ? v : null);
const strings_ = (v: unknown) =>
  Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string'))] : [];
const counts = (v: unknown) =>
  Array.isArray(v)
    ? [
        ...new Set(
          v.filter((x): x is number => typeof x === 'number' && Number.isInteger(x) && x >= 0),
        ),
      ]
    : [];

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const TEXT_SCALES: readonly TextScaleName[] = ['normal', 'large', 'xlarge'];
const TASK_STATUSES: readonly TaskStatus[] = ['pending', 'done', 'snoozed'];
const NEW_RANKS: readonly NewRank[] = ['queen', 'king', 'ace'];
const MYSTERY_SOURCES: readonly MysterySource[] = ['royalFlush', 'milestone', 'rankUp'];
const SEED_SOURCES: readonly SeedSource[] = ['verified', 'random'];

// ---------- settings ----------

export function defaultSettings(): SettingsData {
  return {
    reminderTimes: defaultReminderTimes(),
    soundOn: true,
    helperPhone: '',
    displayName: strings.common.defaultDisplayName,
    textScale: 'normal',
    standCountdownSec: STAND_COUNTDOWN.default,
    calmMode: false,
    onboardingDone: false,
    permissionsExplained: false,
  };
}

/** Per task: keeps valid 'HH:mm' times (sorted, no duplicates, at most 3), else the defaults. */
function sanitizeReminderTimes(v: unknown): ReminderTimes {
  const defaults = defaultReminderTimes();
  if (!isRecord(v)) return defaults;
  const result = defaults;
  for (const taskId of HAND_ORDER) {
    const raw = v[taskId];
    if (!Array.isArray(raw)) continue;
    const valid = [
      ...new Set(raw.filter((t): t is string => typeof t === 'string' && TIME_RE.test(t))),
    ].sort();
    if (valid.length >= 1 && valid.length <= MAX_REMINDERS_PER_TASK) result[taskId] = valid;
  }
  return result;
}

export function sanitizeSettings(raw: unknown): SettingsData {
  const d = defaultSettings();
  if (!isRecord(raw)) return d;
  return {
    reminderTimes: sanitizeReminderTimes(raw.reminderTimes),
    soundOn: bool(raw.soundOn, d.soundOn),
    helperPhone: str(raw.helperPhone, d.helperPhone),
    displayName: normalizeDisplayName(raw.displayName, strings.common.defaultDisplayName),
    textScale: oneOf(raw.textScale, TEXT_SCALES, d.textScale),
    standCountdownSec: finite(raw.standCountdownSec)
      ? clampStandCountdown(raw.standCountdownSec)
      : d.standCountdownSec,
    calmMode: bool(raw.calmMode, d.calmMode),
    onboardingDone: bool(raw.onboardingDone, d.onboardingDone),
    permissionsExplained: bool(raw.permissionsExplained, d.permissionsExplained),
  };
}

// ---------- progress ----------

export function defaultProgress(todayKey: string): ProgressData {
  return {
    days: {},
    today: freshHand(todayKey),
    rank: 'jack',
    rankLevel: 1,
    pathPosition: 0,
    dailyRoyalFlushClaimedOn: null,
    royalFlushSeenOn: null,
    daysThisWeek: { weekId: mondayOf(todayKey), litDays: [] },
    medals: [],
    claimedMilestones: [],
    claimedRankUps: [],
  };
}

function sanitizeTaskDay(v: unknown, taskId: TaskId, date: string): TaskDay {
  if (!isRecord(v) || v.date !== date) return freshTaskDay(taskId, date);
  const status = oneOf(v.status, TASK_STATUSES, 'pending');
  const day: TaskDay = { taskId, date, status, extraWaterStars: count(v.extraWaterStars) };
  if (finite(v.snoozedUntil)) day.snoozedUntil = v.snoozedUntil;
  if (finite(v.completedAt)) day.completedAt = v.completedAt;
  if (status === 'done' && day.completedAt === undefined) day.status = 'pending';
  if (status === 'snoozed' && day.snoozedUntil === undefined) day.status = 'pending';
  return day;
}

/** The whole hand shares one date; if it is unreadable, a fresh hand for `todayKey` is dealt. */
function sanitizeToday(v: unknown, todayKey: string): TodayHand {
  if (!isRecord(v)) return freshHand(todayKey);
  const first = HAND_ORDER.map((id) => v[id]).find(isRecord);
  const date = first && isDateKey(first.date) ? first.date : todayKey;
  const hand = {} as TodayHand;
  for (const taskId of HAND_ORDER) hand[taskId] = sanitizeTaskDay(v[taskId], taskId, date);
  return hand;
}

function sanitizeDays(v: unknown): Record<string, DayRecord> {
  if (!isRecord(v)) return {};
  const days: Record<string, DayRecord> = {};
  for (const [key, rec] of Object.entries(v)) {
    if (!isDateKey(key) || !isRecord(rec)) continue;
    const completed = Array.isArray(rec.completed)
      ? [...new Set(rec.completed.filter(isTaskId))]
      : [];
    days[key] = { date: key, completed, ticketsEarned: count(rec.ticketsEarned) };
  }
  return days;
}

function sanitizeWeek(v: unknown, todayKey: string): WeekState {
  if (!isRecord(v) || !isDateKey(v.weekId)) return { weekId: mondayOf(todayKey), litDays: [] };
  return { weekId: v.weekId, litDays: strings_(v.litDays).filter(isDateKey) };
}

export function sanitizeProgress(raw: unknown, todayKey: string): ProgressData {
  const d = defaultProgress(todayKey);
  if (!isRecord(raw)) return d;
  return {
    days: sanitizeDays(raw.days),
    today: sanitizeToday(raw.today, todayKey),
    rank: oneOf(raw.rank, PLAYER_RANKS, d.rank),
    rankLevel: count(raw.rankLevel, 0) >= 1 ? count(raw.rankLevel) : d.rankLevel,
    pathPosition: count(raw.pathPosition),
    dailyRoyalFlushClaimedOn: dateOrNull(raw.dailyRoyalFlushClaimedOn),
    royalFlushSeenOn: dateOrNull(raw.royalFlushSeenOn),
    daysThisWeek: sanitizeWeek(raw.daysThisWeek, todayKey),
    medals: strings_(raw.medals),
    claimedMilestones: counts(raw.claimedMilestones),
    claimedRankUps: strings_(raw.claimedRankUps).filter((r): r is NewRank =>
      (NEW_RANKS as readonly string[]).includes(r),
    ),
  };
}

// ---------- rewards ----------

export function defaultRewards(): RewardsData {
  return {
    aceTickets: 0,
    goldStars: 0,
    unlockedItems: [DEFAULT_CARD_BACK_ID, DEFAULT_TABLE_ID],
    equippedCardBack: DEFAULT_CARD_BACK_ID,
    equippedTable: DEFAULT_TABLE_ID,
    gamesWon: 0,
    pendingMysteryRewards: [],
    lastRevealedPrize: null,
    newlyUnlockedItemIds: [],
  };
}

function sanitizePending(v: unknown): PendingMystery[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const result: PendingMystery[] = [];
  for (const p of v) {
    if (!isRecord(p) || typeof p.id !== 'string' || seen.has(p.id)) continue;
    if (!finite(p.seed) || !finite(p.createdAt)) continue;
    const source = oneOf(p.source, MYSTERY_SOURCES, 'milestone');
    if (p.source !== source) continue;
    const pending: PendingMystery = { id: p.id, source, seed: p.seed, createdAt: p.createdAt };
    if (count(p.milestoneStep, -1) >= 0) pending.milestoneStep = count(p.milestoneStep);
    seen.add(p.id);
    result.push(pending);
  }
  return result;
}

function sanitizePrize(v: unknown): Prize | null {
  if (!isRecord(v)) return null;
  if ((v.type === 'tickets' || v.type === 'stars') && count(v.amount) > 0) {
    return { type: v.type, amount: count(v.amount) };
  }
  if (v.type === 'item' && typeof v.itemId === 'string') return { type: 'item', itemId: v.itemId };
  return null;
}

export function sanitizeRewards(raw: unknown): RewardsData {
  const d = defaultRewards();
  if (!isRecord(raw)) return d;
  const unlocked = [...new Set([...d.unlockedItems, ...strings_(raw.unlockedItems)])];
  const equip = (v: unknown, fallback: string) =>
    typeof v === 'string' && unlocked.includes(v) ? v : fallback;
  return {
    aceTickets: count(raw.aceTickets),
    goldStars: count(raw.goldStars),
    unlockedItems: unlocked,
    equippedCardBack: equip(raw.equippedCardBack, d.equippedCardBack),
    equippedTable: equip(raw.equippedTable, d.equippedTable),
    gamesWon: count(raw.gamesWon),
    pendingMysteryRewards: sanitizePending(raw.pendingMysteryRewards),
    lastRevealedPrize: sanitizePrize(raw.lastRevealedPrize),
    newlyUnlockedItemIds: strings_(raw.newlyUnlockedItemIds).filter((id) => unlocked.includes(id)),
  };
}

// ---------- solitaire ----------

export function defaultSolitaire(): SolitaireData {
  return { save: null, playedWinnableSeeds: [] };
}

/**
 * Checks the outline of a saved game. The full card-by-card check comes with the engine and the
 * compact save format in task 12.6; until then a save with the wrong outline is dropped.
 */
function sanitizeSave(v: unknown): SolitaireSave | null {
  if (!isRecord(v) || !finite(v.seed) || !finite(v.startedAt)) return null;
  const seedSource = oneOf(v.seedSource, SEED_SOURCES, 'random');
  const looksLikeGame = (g: unknown) =>
    isRecord(g) &&
    Array.isArray(g.stock) &&
    Array.isArray(g.waste) &&
    Array.isArray(g.tableau) &&
    isRecord(g.foundations);
  if (!looksLikeGame(v.state)) return null;
  const past = Array.isArray(v.past) ? v.past.filter(looksLikeGame) : [];
  return {
    seed: v.seed,
    seedSource,
    state: v.state as unknown as GameState,
    past: past as unknown as GameState[],
    startedAt: v.startedAt,
  };
}

export function sanitizeSolitaire(raw: unknown): SolitaireData {
  if (!isRecord(raw)) return defaultSolitaire();
  return { save: sanitizeSave(raw.save), playedWinnableSeeds: counts(raw.playedWinnableSeeds) };
}
