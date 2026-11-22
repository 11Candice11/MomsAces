# Design: Mom's Aces

Covers requirements G1-G9 and R1-R20 in `requirements.md`.

## 1. Architecture

Layers, with imports allowed only downward:

```
screens / components   (UI only; celebrations and mascot via shared components)
        |
navigation             (typed routes)
        |
store                  (Zustand + persist, calls domain, calls services via thin actions)
        |
domain                 (pure TS, no React/Expo/MMKV, time and seed injected)
services               (notifications, calling, storage: only place for platform APIs)
```

```
src/
  theme/        colors.ts typography.ts spacing.ts touch.ts motion.ts useMotion.ts index.ts
  strings/      en.ts index.ts
  domain/
    shared/      rng.ts (seeded mulberry32)
    solitaire/   types.ts deck.ts deal.ts moves.ts engine.ts undo.ts hint.ts win.ts solver.ts seeds.ts autoFinish.ts
    rewards/     economy.ts tickets.ts stars.ts unlocks.ts prizes.ts medals.ts
    progression/ rank.ts path.ts royalFlush.ts week.ts
    reminders/   schedule.ts snooze.ts time.ts
    tasks/       definitions.ts completion.ts hand.ts standCountdown.ts
  store/        settingsStore.ts progressStore.ts rewardsStore.ts solitaireStore.ts celebrationStore.ts(not persisted)
  services/     storage.ts notifications.ts calling.ts permissions.ts batteryOptimisation.ts backup.ts
  navigation/   RootNavigator.tsx TabNavigator.tsx types.ts
  screens/      Welcome Guide Home Path Move StandWithHelp ExerciseList ExerciseSession Play Solitaire Win Rewards Settings Permissions BatteryGuide
  components/
    mascot/         Mascot.tsx poses
    celebrations/   CelebrationHost CelebrationOverlay TaskComplete RoyalFlush MysteryReveal Win RankUp Confetti
    hand/           FeaturedCard HandRow MiniCard
    BigButton IconButton ProgressRing TicketCounter StarCounter RankBadge CardView HelpButton ScreenFrame ...
  assets/       lottie/ icons/ cardbacks/ mascot/ fonts/
  data/         exercises.ts collection.ts prizes.ts medals.ts winnableSeeds.ts (generated)
scripts/        generateWinnableSeeds.ts (dev tool, run with tsx; not bundled in the app)
docs/design/    Stitch screenshots (Home, Move, Path, task-complete, Royal Flush): visual references only
```

Path alias `@/` maps to `src/` in `tsconfig.json`, Babel (module-resolver) and Jest `moduleNameMapper`.

### Platform isolation (G8)
- `services/*` expose platform-neutral interfaces. Android-only parts (notification channel, exact alarm permission, battery-optimisation intent, system "remove animations" read) are inside `Platform.OS === 'android'` branches.
- No `ios/` folder is generated yet.

### Shared-component rule
Celebrations and the mascot are used only through `components/celebrations` and `components/mascot`. Screens call `celebrate({...})` and render `<Mascot />`. They contain no one-off animation code.

## 2. Tooling

- Expo SDK **56.0.24** with React Native 0.85.3, `expo-dev-client`, and `react-native-mmkv` **4.3.2** with `react-native-nitro-modules` **0.35.9**. All versions are pinned exactly (no `^` or `~`), and the full list is in `.kiro/steering/tech.md`. `react-native-mmkv` and `lottie-react-native` need a development build, so Expo Go is not used.
- Why these versions: Expo SDK 56 ships React Native 0.85.3, which is the version `react-native-mmkv` 4.3.2 is developed against, and 0.35.9 is the Nitro version its generated code was built with. Newer SDKs (57, 58) exist but were not checked against MMKV, so upgrading is a deliberate later task.
- **Gate:** task 1.9 must pass `npx expo-doctor` and start a development build on a device or emulator before anything else is built on top. If MMKV v4 or Nitro causes any problem, work stops and the problem is reported with a proposed fallback (section 5), never worked around silently.
- `expo-updates` is not installed: there are no over-the-air updates (section 24).
- Install with `npx expo install` so Expo-managed packages match the SDK. `.npmrc` sets `save-exact=true`, `package-lock.json` is committed, and `npx expo install --check` and `npx expo-doctor` must pass.
- `tsx` (dev dependency) runs `scripts/generateWinnableSeeds.ts` through `npm run seeds:generate`.
- Jest: `ts-jest`, node environment, `@/` mapper.
- ESLint (typescript-eslint, react-hooks, import) with `no-restricted-imports` for `react*`, `expo*`, `react-native*` in `src/domain/**`.
- Prettier. Scripts: `start`, `android`, `lint`, `typecheck`, `test`, `format`.
- Fonts via `expo-font` with `@expo-google-fonts/playfair-display` and `@expo-google-fonts/nunito` (font files ship in the package, no network at runtime).
- `react-native-svg` for rings and the Path drawing.

## 3. Theme tokens (`src/theme`)

```ts
colors = {
  burgundy: '#7A1F2B', purple: '#4B2A6B', magenta: '#C2185B',
  gold: '#D4A94F', goldHighlight: '#F6D98B',
  cream: '#FFF8E7', velvet: '#2A1238',
  velvetRaised: '#3B1E4F',          // panels, cards and dialogs on the dark theme
  text: '#2B1B2E', textOnDark: '#FFF8E7',
  done: '#2E7D32',                  // green: only for Done checks, always on a cream chip
  disabled: '#B9AFC0', surface: '#FFFFFF', shadow: '#00000033',
}
typography = {
  heading: 'PlayfairDisplay_700Bold',
  body: 'Nunito_600SemiBold',
  size: { body: 20, bodyLarge: 24, button: 26, title: 32, hero: 44 }, // sp
  lineHeightRatio: 1.35,
}
spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 }
radii   = { sm: 8, md: 16, lg: 28, pill: 999 }
touch   = { min: 72, primary: 88, gap: 16 }
textScale = { normal: 1, large: 1.25, xlarge: 1.5 }
motion = {
  duration: { instant: 0, fast: 200, normal: 400, slow: 800, celebrate: 2000 },  // ms
  easing:   { standard, gentle, bounceSoft },       // Reanimated Easing functions
  effects:  { confettiCount: 40, sparkleCount: 8 },
  glow:     { periodMs: 2400, minOpacity: 0.7, maxOpacity: 1 }, // slow, low-amplitude
}
```
- The whole app uses the dark theme: `velvet` background, `velvetRaised` panels, cream text. There is no light theme.
- `useTheme()` multiplies typography sizes by the `textScale` setting.
- Contrast pairs verified in the audit: cream on velvet, gold on velvet, cream on burgundy, cream on purple, dark text on gold (never cream on gold), dark text on cream, magenta on cream.
- Tokens are semantic plain objects so they map to a NativeWind config later.
- **Large text layout (R12.9):** at `large` and `xlarge`, a card's title takes the full row width (no title squeezed beside a chip). Chips and reward rows (for example "+5 stars") move to their own row below the title. Shared `CardRow` and `RewardRow` components implement this once, and screens use them instead of ad hoc rows.

### Motion level (`useMotion`)
```ts
type MotionLevel = 'full' | 'calm' | 'none';
```
- `none` if the Android system "remove animations" is on (`AccessibilityInfo.isReduceMotionEnabled` plus change listener; Reanimated `useReducedMotion`).
- else `calm` if `settings.calmMode`.
- else `full`.
- `useMotion()` returns `{ level, duration(name), count(name), loop: boolean, flash: false }` computed from the tokens:
  - `full`: tokens as defined.
  - `calm`: durations x1.5 for fades and movement (slower and gentler), no loops, no shake, effect counts x0.25, glow becomes a static border, celebrations use crossfade plus a single soft scale.
  - `none`: duration 0 or a short crossfade (150ms), counts 0, no loops, static end states.
- Nothing flashes in any level. Glow pulse is at most one cycle per 2.4s with a small opacity change.
- Because animation code reads only `useMotion()`, Calm mode scales everything in one place (R19.4).

## 4. Data models

```ts
type TaskId = 'water' | 'bathroom' | 'stretch' | 'stand';
type TaskStatus = 'pending' | 'done' | 'snoozed';

interface TaskDefinition { id: TaskId; icon: string; labelKey: StringKey; notificationKey: StringKey; }

interface TaskDay {                 // one per task per day (one play per task per day)
  taskId: TaskId; date: string;     // 'YYYY-MM-DD' local date
  status: TaskStatus; snoozedUntil?: number; completedAt?: number; // epoch ms
  extraWaterStars: number;          // water only: repeat-Done stars earned today (0 to economy cap)
}

type ReminderTimes = Record<TaskId, string[]>;   // 'HH:mm', sorted, 1-3 per task

type Rank = 'jack' | 'queen' | 'king' | 'ace';

interface Settings {
  version: 2;
  reminderTimes: ReminderTimes;                   // default below
  soundOn: boolean; helperPhone: string;
  displayName: string;                            // default 'Mom'; what Ace calls her, max 20 characters
  textScale: 'normal' | 'large' | 'xlarge';
  standCountdownSec: number;                      // default 30; clamped to 15-60 (domain/tasks/standCountdown.ts)
  calmMode: boolean;                              // default false
  onboardingDone: boolean; permissionsExplained: boolean;
}

interface Progress {
  version: 2;
  days: Record<string, DayRecord>;                // pruned to last 90 days
  today: Record<TaskId, TaskDay>;                 // today only, reset daily
  rank: Rank; rankLevel: number;                  // derived from pathPosition, stored for display and migration
  pathPosition: number;                           // steps; never decreases
  dailyRoyalFlushClaimedOn: string | null;        // 'YYYY-MM-DD'
  royalFlushSeenOn: string | null;                // date its celebration was shown; null/older = still to show
  daysThisWeek: { weekId: string; litDays: string[] };   // positive-only; UI shows "N days this week"
  medals: string[];                               // earned medal ids
  claimedMilestones: number[];                    // path chest steps already granted
  claimedRankUps: PlayerRank[];                   // new ranks (queen, king, ace) whose mystery card was granted
}
interface DayRecord { date: string; completed: TaskId[]; ticketsEarned: number; }

interface Rewards {
  version: 2;
  aceTickets: number; goldStars: number;
  unlockedItems: string[];
  equippedCardBack: string; equippedTable: string;
  gamesWon: number;
  pendingMysteryRewards: PendingMystery[];        // unrevealed, seed fixed at creation
  lastRevealedPrize: Prize | null;
  newlyUnlockedItemIds: string[];                 // drives "New!" ribbons
}
interface PendingMystery { id: string; source: 'royalFlush' | 'milestone' | 'rankUp'; milestoneStep?: number; seed: number; createdAt: number; }  // milestoneStep links a Path chest node to its waiting card

type Prize =
  | { type: 'tickets'; amount: number }
  | { type: 'stars'; amount: number }
  | { type: 'item'; itemId: string };

interface PrizeEntry { id: string; type: 'tickets' | 'stars' | 'item'; amount?: number; itemId?: string; weight: number; }  // built in data/prizes.ts from economy.ts

interface CollectionItem { id: string; type: 'cardBack' | 'tableColour'; name: StringKey; tier: 1 | 2 | 3; theme: 'red' | 'purple' | 'gold'; asset: ImageSourcePropType | ThemeColors; }  // price = ECONOMY.itemPrices[tier]

interface SolitaireSave { version: 1; seed: number; seedSource: 'verified' | 'random'; state: GameState; past: GameState[]; startedAt: number; }
interface SolitaireMeta { playedWinnableSeeds: number[]; }   // persisted with the save; reset when every seed has been played
```

- Stores: `settingsStore`, `progressStore`, `rewardsStore`, `solitaireStore`. Each persists under its own MMKV key with `version` and `migrate`.
- `celebrationStore` is in-memory only (queue of presentation events). Rewards are saved to the persisted stores before a celebration is queued (G9). On launch the app rebuilds missed celebrations from persisted state: pending mystery rewards, and a Royal Flush that was earned but not yet shown (flag `royalFlushSeenOn` in `Progress`).
- Static item definitions are in `data/collection.ts`; only ids are persisted.
- Because no previous version has shipped, the version-2 shapes above are the first real shapes; migrations start from version 2.

## 5. Persistence (`services/storage.ts`)

```ts
import { createMMKV } from 'react-native-mmkv';   // v4 API (a Nitro module)
const mmkv = createMMKV({ id: 'moms-aces' });
export const zustandStorage: StateStorage = {
  getItem: (k) => mmkv.getString(k) ?? null,
  setItem: (k, v) => mmkv.set(k, v),
  removeItem: (k) => { mmkv.remove(k); },
};
```
- **Fallback if MMKV v4 or Nitro fails** (build error, crash, or incompatibility found in task 1.9): replace the body of this adapter with `@react-native-async-storage/async-storage` (the Expo SDK 56 version), which Zustand `persist` supports through the same `StateStorage` shape (its async methods are accepted). Nothing outside `services/storage.ts` changes, which is why stores only ever see the adapter. The decision is made with the owner, not silently.
- MMKV v4 replaced `new MMKV()` with `createMMKV()` and `delete()` with `remove()`; older examples online use the v3 API. It needs `react-native-nitro-modules` and the New Architecture, which Expo SDK 56 uses by default.
- `persist(..., { name, version, storage: createJSONStorage(() => zustandStorage), migrate, partialize })`.
- Extension point for backup (R10.5): `services/backup.ts` exports `exportBackup()` and `importBackup(json)` as documented stubs that throw "not implemented", not wired to the UI, plus a `BACKUP_STORE_KEYS` list of every persisted key.
- `android:allowBackup="false"`. Application id `com.candice.momspace`.

## 6. Tasks, the hand and reminder schedule (domain/tasks, domain/reminders)

### Reminder times
Each task has its own list of reminder times. Defaults (`DEFAULT_REMINDER_TIMES`, one constants file):

| Task | Times |
| --- | --- |
| Water | 09:00, 12:00, 17:00 |
| Stretch | 10:00 |
| Bathroom | 11:00, 16:00 |
| Stand | 15:00 (her helper is present until 17:00) |

There is no shared interval grid: the earlier start, end and interval setting is replaced by these per-task times, edited per reminder in Settings.

`buildSchedule(times): Reminder[]` returns every reminder sorted by time, `Reminder = { id: "<taskId>-<time>", taskId, time, firstOfDay: boolean }`. `firstOfDay` is true for the earliest time of each task. `validateReminderTimes(times)` rejects bad `HH:mm` formats, duplicates within a task, more than 3 times per task, and more than one reminder at the same minute across tasks (so each notification names exactly one task). It returns a friendly error key.

### The hand and one play per task per day
- The Hand has 4 cards, one per task. Each task can be played once per day.
- `handState(today, times, now)` returns `{ cards: Array<{ taskId, state: 'pending' | 'played', dueTime: string, isDue: boolean }>, next: { taskId } | null, playedCount }`.
- `handState` is the single source of truth for both the featured card and the small row. A card that is `played` is never `next`, never `isDue` for display, and never the featured card (R1.17); a test covers this.
- A card is `played` once its task is completed today. `dueTime` of a pending card is its `snoozedUntil` if snoozed, otherwise the earliest reminder time of its task (by default water 09:00, stretch 10:00, bathroom 11:00, stand 15:00). `isDue` is `dueTime <= now`.
- **`next`**: among the pending cards, the one with the earliest `dueTime` that `isDue`; if none is due yet, the pending card with the earliest `dueTime` overall (ties follow water, stretch, bathroom, stand). `next` is `null` only when all 4 cards are played. The due time only decides which card is next. Any pending card can be played at any time.
- **Focus card.** `homeFocus: TaskId | null` is transient (not persisted). When she opens the app from a notification "Done" or "Start", it is set to that notification's task, and the Home screen treats that card as NEXT (`next = focus` while it is pending). It clears when she plays or snoozes that card or plays another one.
- UI: a pending card with `isDue = false` shows a clock icon and its due time. There is no padlock and no locked state.
- Quiet rollover: a pending card stays pending until played. Nothing is counted or flagged as overdue.
- **Ace on Home (R14.6):** before her first reminder of the day and with no card due, Ace is **sleeping** (gentle message) and the NEXT card is still shown with its clock and due time. When all 4 cards are played, Ace is **waving** with an "all caught up" message. At every other time Ace is awake and speaks about the NEXT card.

### Playing a card (`playCard`) and repeat taps
- **Who completes what:** Water and Bathroom complete immediately. Stretch opens `ExerciseSession` and completes when the session finishes. Stand opens `StandWithHelp` and completes at step 4, or on "Sit down" after the checklist (R4.6). This keeps the Stand safety flow from being skipped.
- **Taps on Home:** the "Play card" button and a tap on the featured card are the same `playCard(next)` call. A tap on another pending small card shows a calm "Play the <name> card now?" confirm with a big "Yes" and a big "Not yet" (R1.13). A tap on a played card gives only an Ace message (R1.16).
- `resolveDone(today, taskId, source: 'home' | 'notification', now): DoneResult`, a pure function in `domain/tasks`:
```ts
type DoneResult =
  | { kind: 'played'; reward: TaskCardReward }                    // Water/Bathroom first Done: ECONOMY.taskCard
  | { kind: 'openFlow'; flow: 'exercise' | 'stand' }              // from Home: Stretch/Stand not yet played
  | { kind: 'guide'; taskId: 'stretch' | 'stand' }                // from a "Start" notification: Home opens, Ace invites her
  | { kind: 'extraWater'; stars: number; remainingToday: number } // played Water, source 'notification', under the cap
  | { kind: 'repeat'; message: 'alreadyPlayed' | 'waterEnough' }  // everything else; never a scolding wording
```
  - `extraWater` is returned only for `taskId = 'water'`, `source = 'notification'`, a played card, and `extraWaterStars < ECONOMY.extraWater.maxPerDay`. At the cap it returns `repeat` with `waterEnough`. Extra water gives stars only: no ticket, path step or Royal Flush credit.
  - A played card tapped on Home (any task, including Water) returns `repeat` with `alreadyPlayed`: an Ace message and nothing else.
  - A notification action on any other played task returns `repeat` with `alreadyPlayed`. Nothing is ever silently ignored (G10).
- Each result maps to an Ace message or celebration: `played` -> `TaskComplete` celebration; `extraWater` and `repeat` -> the small `AceMessage` variant of the celebration shell (Ace pose, one friendly line, a "+1 star" chip for extra water, an "OK" button); `guide` -> Home with `homeFocus` set and Ace's speech bubble inviting her to play the card.

### Completion
`completeTask(today, taskId, now)` applies `played`: sets `status = 'done'` and `completedAt`, and returns `{ today, reward }` where `reward` comes from `ECONOMY.taskCard` (tickets, stars, pathSteps). It is idempotent: calling it again for a played task changes nothing (R3.3). `snoozeTask(today, taskId, now, minutes = 10)` sets `snoozedUntil` and does nothing for a played task.

### Rollover
At launch and at midnight, `rollDay(progress, date)` starts a fresh day record (all cards pending), archives yesterday into `days`, and updates "days this week". Nothing about missed items is displayed.

## 7. Progression (domain/progression)

All functions are pure; the date and numbers are arguments.

- `PATH_CONFIG = { stepsPerLevel: 20, levelsPerRank: 5, milestoneEvery: 10 }` (path geometry only). Steps earned per task card and per Royal Flush live in `economy.ts`.
- `advance(pathPosition, steps) -> pathPosition` (steps >= 0; never decreases).
- `rankFromPosition(position) -> { rank, level, progressInLevel }`. Rank order jack, queen, king, ace. Ace level keeps increasing beyond the configured top level.
- `didRankUp(before, after) -> { rankUp: boolean, levelUp: boolean, newRank }` drives the rank-up celebration.
- `milestonesCrossed(before, after, alreadyClaimed) -> number[]` returns new milestone steps, each creating one `PendingMystery`.
- `newRanksReached(before, after, alreadyClaimed) -> PlayerRank[]` returns each of queen, king and ace newly reached (not each level) and not yet in `claimedRankUps`. Each creates `ECONOMY.newRank.mysteryCards` `PendingMystery` (source `rankUp`, `milestoneStep` = the rank's step). At steps 100, 200 and 300 the player therefore gets the milestone chest card AND the new-rank card.
- `isRoyalFlushEligible({ playedToday: TaskId[], claimedOn, today }) -> boolean`: all 4 tasks played today and `claimedOn !== today`.
- `domain/progression/week.ts`: `litDays(days, weekId)` from days with at least one completed task this week; `daysThisWeek(state) -> number` (the "N" in "N days this week"); `rollWeek(state, today)` resets silently when a new week starts. `weekId` uses Monday-start weeks. Functions never return negative values. The interface never uses the word "streak".
- **Path nodes.** `pathNodes(position, aheadSteps) -> PathNode[]` builds the whole board, not only the rank cards:
  - `PathNode = { step, kind: 'start' | 'rank' | 'level' | 'chest', rank, level, reached: boolean, chestReady: boolean }`. `pathNodes` also takes the list of pending mystery cards. `chestReady` is true only when a `PendingMystery` with `source = 'milestone'` and `milestoneStep === step` exists. Nothing else makes a chest "ready".
  - A node exists at every multiple of `milestoneEvery` (10 steps). Every one of them holds a chest.
  - A multiple of `stepsPerLevel` (20) is also a `level` node (levels 2 to 5 within a rank, labelled for example "Queen 3"). A multiple of `stepsPerLevel * levelsPerRank` (100) is a `rank` node (the Queen, King and Ace cards). Step 0 is `start` (Jack, level 1).
  - So each rank section shows its rank card, 4 more level nodes and chest nodes between them (10 nodes of 10 steps). Steps are computed for the top rank by extending past 400 (Ace levels continue).
  - `reached` is `step <= position`. Unreached nodes use a neutral style, never a negative one.
  - UI for chest nodes: every chest node is labelled "Mystery card" and never shows a star or ticket amount. When `chestReady` (a waiting `milestone` or `rankUp` card for that step), the node shows an open-lid chest and the label "Chest ready to open" and is a button that queues `MysteryReveal` for that card. Any other chest node looks like a normal node, with no padlock and no hint of a missing or lost reward.
- **Path screen.** A winding path drawn with `react-native-svg` in a vertical `FlatList`, starting at the Jack section. The token sits at her position. A labelled "Where I am" button at the primary position scrolls to the token (scrolling is never the only way to see where she is). Rank sections have a heading and the 5 level nodes; chest nodes follow the rule above.

## 8. Rewards and mystery prizes (domain/rewards)

```ts
awardTicket(rewards, n = 1) -> Rewards
spendTicket(rewards) -> Rewards | null          // null if 0 tickets
awardStars(rewards, n) -> Rewards
canUnlock(rewards, item), unlockItem(rewards, item) -> Rewards | null   // marks newlyUnlocked
equipItem(rewards, item) -> Rewards | null      // only if unlocked; clears "New!" for that item
markSeen(rewards, itemId) -> Rewards
evaluateMedals({ progress, rewards, stats }) -> string[]                 // newly earned medal ids
```
All functions reject results below zero. They take amounts as arguments; the amounts come from `economy.ts`.

### Economy (`domain/rewards/economy.ts`)
The single file holding every reward number, cost and price (R3.8). Nothing else in `src` repeats these numbers; other modules and tests import them.
```ts
export const ECONOMY = {
  taskCard:      { tickets: 1, stars: 5, pathSteps: 1 },
  extraWater:    { stars: 1, maxPerDay: 3 },
  solitaireWin:  { stars: 15 },
  royalFlush:    { tickets: 2, stars: 20, mysteryCards: 1, pathSteps: 2 },
  milestoneChest:{ mysteryCards: 1 },
  newRank:       { mysteryCards: 1 },        // Queen, King, Ace (not each level)
  mysteryPrize: {                 // exactly one prize per reveal
    tickets: [{ amount: 1, weight: 40 }, { amount: 2, weight: 20 }],
    stars:   [{ amount: 10, weight: 20 }, { amount: 25, weight: 8 }],
    itemWeight: { cardBack: 2, tableColour: 2 },                       // per unowned item
    fallbackStars: 10,            // used when nothing else can be picked
  },
  costs:         { solitaireGameTickets: 1 },
  itemPrices:    { 1: 50, 2: 100, 3: 200 },                              // by tier; cheapest = 50
} as const;
```
- `data/prizes.ts` builds the `PrizeEntry[]` table from `ECONOMY.mysteryPrize` and the collection items; it holds no numbers of its own. `data/collection.ts` gives each item a `tier`.
- **Initial collection (9 purchasable items):** for each theme (red, purple, gold): tier 1 = a card back (50 stars), tier 2 = a table colour (100 stars), tier 3 = a card back (200 stars). A default card back and default table colour are unlocked from the start and are not for sale. With 9 items at weight 2 each (18 in total, against 60 for tickets and 28 for stars), a reveal gives an item about 17% of the time while items remain unowned.
- "Finish for me" (section 17) counts as a Solitaire win, so it pays `ECONOMY.solitaireWin.stars`.
- A unit test checks invariants rather than pinned values, so retuning never breaks tests: all numbers are non-negative integers, weights are positive, prices ascend by tier, and the cheapest price is the minimum of `itemPrices`.
- Royal Flush applies in the store when the 4th distinct card is played and `isRoyalFlushEligible` is true: tickets, stars and path steps are awarded, one `PendingMystery` (source `royalFlush`) is created, and `dailyRoyalFlushClaimedOn` is set. All of it is saved before the celebration plays (G9).

### Prize selection (`prizes.ts`)
```ts
pickPrize(table: PrizeEntry[], seed: number, ownedItemIds: string[]): Prize
```
- Filter out entries whose `itemId` is owned. If nothing remains, return a fallback of `ECONOMY.mysteryPrize.fallbackStars` stars (never throws, always positive).
- Weighted pick: total = sum of weights; `r = rng(seed) * total`; walk the entries. The RNG is the same seeded mulberry32 used by Solitaire (`domain/solitaire/rng.ts` moved to `domain/shared/rng.ts` so both use it).
- `createPendingMystery(source, seed, now)` and `revealMystery(rewards, pending, table)` return the updated `Rewards` with `lastRevealedPrize`, exactly one prize applied, the pending card removed, and `newlyUnlockedItemIds` updated. The prize is computed only at reveal time, so nothing about it exists in the UI before then. The seed is chosen by the store (from `Date.now()` at creation time) and stored with the pending card, so reopening the app never changes the prize.
- `data/prizes.ts` builds the table from `economy.ts`.

## 9. Celebration system

- `CelebrationHost` is mounted once at the root. `celebrationStore` holds a queue of events: `{ kind: 'taskComplete' | 'rankUp' | 'royalFlush' | 'mysteryReveal' | 'win' | 'aceMessage'; payload }`. Order is enforced by priority (R18.3); `aceMessage` is only queued alone. Screens call `celebrate(event)`.
- `CelebrationOverlay` is the shared shell: dimmed velvet backdrop, Ace pose, headline, content slot, and a big "Collect" button at the standard primary position. Variants fill the content slot:
  - `TaskComplete`: the featured card flips into a golden Ace with a sparkle, confetti (red, purple, gold), the ticket and stars fly to the `TicketCounter` and `StarCounter`. The target position is read from a `RewardTargets` registry (counters register their layout). In reduced motion the card shows as an Ace and the counter simply updates with a short crossfade.
  - `RoyalFlush`: full-screen, five cards spread into a royal flush. It shows the guaranteed bonus as chips (+2 tickets, +20 stars, from `economy.ts`), then a closed chest that shows only a "?". Tapping the chest opens it and queues `MysteryReveal`. Nothing about the prize is visible before it opens (R16.2).
  - `AceMessage`: a small variant of the shell for repeat Done: Ace pose, one friendly line, an optional "+1 star" chip, an "OK" button.
  - `MysteryReveal`: shimmering card -> one tap -> flip -> prize with a "New!" ribbon for items.
  - `Win`: stars rise to the counter.
  - `RankUp`: rank badge grows and shows the new rank and level.
- `Confetti`: Reanimated particles, count from `useMotion().count('confettiCount')`, a fixed set of 3 colours, no strobing, short life, fall at moderate speed. Lottie files are used for the sparkle, chest and card flips (placeholders first).
- Every variant renders a complete static end state even with `none` motion, and the "Collect" button is always available. Rewards are already saved before the overlay appears (G9), so "Collect" only dismisses it and moves to the next queued event.
- **Layout safety (R18.7):** the `CelebrationOverlay` content slot has reserved zones: a text zone (title, subtitle) and a decoration layer drawn behind it with `pointerEvents="none"`. Stars, sparkles and confetti are positioned only outside the text zone's measured bounds, and fall behind the text rather than over it. Card faces keep an inner padding so the corner indices (rank and suit) are never clipped, including at the largest text size. Both are checked on the Royal Flush and task-complete screens in the UI acceptance checks.
- Haptics are not used in the first version.

## 10. Mascot (`components/mascot`)

```tsx
<Mascot pose="waving" | "cheering" | "thinking" | "sleeping" message={StringKey | string} size="small" | "large" />
```
- The supplied Ace art is the base mascot (`assets/mascot/`). Only one pose exists for now, so every pose key maps to that single image (a `POSES` map with one entry repeated) and the other poses are added later without changing callers. The still pose is always available. Still pose in `none` motion; gentle idle loop only in `full`.
- The speech bubble uses body text (>= 20sp), maximum about 12 words, high contrast.
- `strings.mascot` holds pools of lines per context (`nextWater`, `nextBathroom`, `nextStretch`, `nextStand`, `allCaughtUp`, `sleeping`, `noTickets`, `welcome`, `cheer`, `rankUp`, ...). `pickLine(lines, seed)` is a small pure helper that rotates lines by day so messages feel fresh but stay stable within a day.
- Ace calls her by `settings.displayName` (default "Mom"). Mascot lines are functions of the name, for example `nextWater: (name) => "Time for a sip of water, " + name + "!"`, so no line hard-codes it. A `useDisplayName()` hook supplies it. Notification text is built the same way, and `syncReminders` runs again when the name changes (R2.21).

## 11. Navigation map

```
Root (native stack)
 |- Onboarding: Welcome -> Guide (3 screens) -> Permissions   [first launch only]
 |- Tabs (bottom): Home | Move | Play | Rewards
 |- Path                 (from Home rank badge)
 |- StandWithHelp (4 levels)
 |- ExerciseSession
 |- Solitaire
 |- Win
 |- Settings
 |- BatteryGuide
 |- Guide, titled "Where am I?"  (presented as a modal, opened by the Help button)
CelebrationHost         (overlay mounted at root; Royal Flush and Mystery Reveal are overlays, not routes)
```
- Four tabs only. The Path is a stack route.
- Tap budget: Home -> Play card (1). Home -> rank badge -> Path (1). Home -> Stand With Help via Move (2). Play -> Solitaire (2). Rewards -> equip (2). Home -> Settings -> Calm mode (2).
- Settings is reached from a labelled "Settings" button in the Home top bar and the Rewards header.
- Typed with `RootStackParamList` and `TabParamList`.
- A `navigationRef` lets the notification handler route to Home (`Tabs > Home`). If navigation is not ready yet (cold start), the route is queued and applied when it is.
- `ScreenFrame` supplies the top bar with `HelpButton` (label "Help") at a fixed position, content, and a bottom action zone at a fixed position for the primary action.
- The Android back button is supported, and screens that can be left show a labelled "Back" button.

## 12. Home layout (R1, R14)
Matches the Home mockup (`docs/design/home.png`) except for the differences in section 25. Top to bottom:
1. Top bar: "Home" title (left), "Settings" and "Help" buttons (right).
2. Rewards strip directly under the top bar: `TicketCounter`, `StarCounter` and `RankBadge` (tapping the badge opens the Path). It is on its own row so 72dp targets fit at the largest text size.
3. Mascot Ace with a speech bubble.
4. "Today's Hand" heading, then the **`FeaturedCard`**: the NEXT card, large, with a gold border and glow (static border in all motion levels, slow glow only in `full`). It shows the task icon, the task name, a due-time chip (for example "10:30 AM"), a status bar with "Due now" (gold dot) or "Due at <time>" (clock icon), and the reward (`+1 Ticket`, `+5 Stars` read from `ECONOMY`). Tapping it does the same as "Play card".
5. **`HandRow`**: 4 `MiniCard` (Water, Bathroom, Stretch, Stand) beneath the featured card. Each shows its icon and label; played = gold tick (and "Played"); pending = clock and due time. The NEXT card's mini card is highlighted. Tapping a pending mini card that is not NEXT asks "Play the <name> card now?" with "Yes" and "Not yet"; tapping a played mini card gives Ace's repeat message. Each has an accessibility label such as "Bathroom card, due at 11:00 AM".
6. Hand Progress: "2 of 4 cards played", a progress bar and a closed "Royal Flush" chest chip that shows a "?" and nothing else.
7. Bottom action zone: "Play card" (primary, 88dp, lower-right-weighted) and "Later" (72dp, smaller, left of primary).
- **Single source of truth:** `FeaturedCard` and `HandRow` both read the same `handState`. A played card can never be the featured card or "Due now" (R1.17).
- **All played:** `FeaturedCard` becomes a golden Ace "All played today" card, Ace waves with "all caught up", and the bottom zone shows one "Go to Play" button (to the Play tab) instead of "Play card" and "Later".
- Ace's pose and line follow section 6: sleeping before her first reminder (the NEXT card is still shown with its clock), waving once all 4 cards are played, awake otherwise.
- When `homeFocus` is set (she came from a notification), that card is the featured card and Ace invites her to play it.
- If a mystery card is pending, the celebration queue shows it once after Home gains focus. It stays pending until revealed.
- Time display: every time shown to her uses one `formatTime` helper in 12-hour form with AM/PM; stored times stay `HH:mm`.

## 13. Notifications (`services/notifications.ts`)

- Library: `expo-notifications`. Android channels `reminders-v1` (HIGH, sound) and `reminders-silent-v1`, versioned because channel settings cannot change after creation.
- **Scheduling**: for each reminder from `buildSchedule(settings.reminderTimes)`, schedule a `DAILY` trigger (`{ hour, minute }`) with identifier `reminder-<taskId>-HH:mm`. Each notification names one task. Content comes from `strings.notifications` in Ace's voice, e.g. "Ace says: time for water, Mom!", with a gentler wording for nudges (`firstOfDay = false`). `data = { taskId, time }`. Text uses `settings.displayName`.
- **Icon**: the small icon is a single-colour crown-card silhouette configured through the expo-notifications config plugin, with the burgundy accent colour. Android does not allow a full-colour image as the small icon; whether a full-colour large icon is usable with expo-notifications is verified in task 6.
- **Sync** `syncReminders(settings)`: compute the desired set from `buildSchedule`; read `getAllScheduledNotificationsAsync`; cancel any that are not desired or differ in content or channel; schedule missing ones. Called on app launch, after reminder-related settings changes, and after permissions are granted. Idempotent.
- **Actions and categories** (two notification categories, because the first label differs):
  - `reminder-done`: actions `DONE` ("Done") and `LATER` ("Later"). Used for Water and Bathroom.
  - `reminder-start`: actions `START` ("Start") and `LATER` ("Later"). Used for Stretch and Stand, which complete only through their guided flows.
  - Every action has `opensAppToForeground: true`, so the app comes to the front and she sees the result straight away. Tapping the notification body also opens the app. All of them route to Home. The one-off "Later" reminder keeps the category of its task.
- **Response handling** (`handleNotificationResponse`):
  1. The listener (`addNotificationResponseReceivedListener`) is registered at module load, before the first render, so a cold-start response is not missed. At launch `getLastNotificationResponseAsync()` is also read. **Android may deliver only the latest response at launch**, not every earlier one. Because every action opens the app, each tap normally starts or foregrounds the app and is handled on its own, so at most one response is usually waiting. The code still handles a list, so any further responses the platform does deliver are processed too (R2.19).
  2. Each response gets a key `identifier|actionIdentifier|notification.date`. Keys already in the handled log (a capped list in MMKV, last 50) are skipped, so a response is processed exactly once.
  3. New responses are put in a queue and sorted by timestamp, earliest first, then processed one at a time. The response object does not carry its own tap time, so the sort uses `notification.date` (when the notification was delivered), with the time our code received the response as a tiebreak. Task 6.6 checks on a device which timestamps expo-notifications actually provides, and the ordering rule is adjusted if needed.
  4. `DONE` or `START` -> `resolveDone(today, data.taskId, 'notification', now)` and the result is shown as in section 6 (celebration, `AceMessage`, or Ace's invitation with `homeFocus` set). `LATER` -> `snoozeTask`, a one-off notification in 10 minutes, and an Ace confirmation. The body tap does nothing except open Home.
  5. After processing, navigate to Home (queued until navigation is ready).
- **Completed hand**: because both actions open the app, the Royal Flush celebration plays on Home at once. The persisted `royalFlushSeenOn` flag still covers the case where the celebration could not be shown, so it appears on the next open (R2.14, R16.4).
- **Reliability and Android limits**: scheduled alarms survive the app being swiped from recent apps and a restart (expo-notifications re-registers them on boot, and the launch sync repairs anything lost). A manual "Force stop" in Android settings cancels all alarms until the app is next opened; Android offers no way around that, so it is out of scope (R2.20). Samsung's sleeping-apps lists are handled by the battery-optimisation guidance.
- **Acceptance** (task 6.7), all on a real Samsung phone: reminders arrive on time with the app open, in the background, swiped away from recent apps, and after a restart; Done (Water, Bathroom), Start (Stretch, Stand) and Later each open the app to Home and behave per R2.7 and R2.8; tapping the body opens Home; two notifications actioned back to back are both processed exactly once and in time order.
- **Permissions** (`services/permissions.ts`): `POST_NOTIFICATIONS` (Android 13+); exact alarm (`SCHEDULE_EXACT_ALARM`, Android 12+) check with a deep link to the system setting. A friendly Permissions screen with Ace explains first. Whether expo-notifications daily triggers use exact alarms is verified in task 6.
- **Battery optimisation** (`services/batteryOptimisation.ts`): guidance screen with 3 illustrated steps and a button using `Linking.sendIntent('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS')`, falling back to `Linking.openSettings()`. For Samsung it covers three settings: the "Put unused apps to sleep" switch (turn it off, or make sure Mom's Aces is excluded), the "Sleeping apps" and "Deep sleeping apps" lists (Mom's Aces must not be on them), and the "Never sleeping apps" list (add Mom's Aces if the phone offers it). Menu names differ between One UI versions, so the final wording and screenshots come from her phone during task 6.7 and are written into the guidance screen in task 15.3.
- **Reminder checkpoint on her phone:** after task 6.5 a build is installed on her phone and the 6.7 acceptance runs over several days while later tasks continue (task 6.8).

## 14. Calling (`services/calling.ts`)

`callHelper(phone)` -> `Linking.openURL('tel:' + sanitised)` (opens the dialer; she presses call, so no `CALL_PHONE` permission). Optional `messageHelper(phone)` -> `https://wa.me/<digits>` (a user-initiated external link). `canOpenURL` needs `<queries>` entries in the Android manifest via a small config plugin.

## 15. Stand With Help design (R4)

- Step 1 has a large "Call for help" button that only opens the dialer (`callHelper`) and never advances, and a big "My helper is here" button at the primary position that goes to step 2. If no helper number is saved, "Call for help" shows the Settings prompt and "My helper is here" still works.
- Local state machine: `call -> checklist -> ready -> countdown -> victory` (steps 1 to 4, with step 3 split into `ready` and `countdown`), not persisted. A `LevelTrack` component shows 4 nodes with the current one highlighted ("Level 1 of 4" style wording from strings, no pressure).
- Step 2: each checklist row is a large toggle; ticking plays a tick animation (`useMotion`, static tick when reduced). "Next" is disabled until all three are ticked.
- Step 3 has two states:
  - `ready`: a big "Start" button at the primary position, a line for the helper ("Helper, tap Start when you are both ready"), and "Sit down" visible as the secondary button. The countdown has NOT started. Entering the screen never starts it.
  - `countdown`: started by the helper tapping "Start". `useCountdown(seconds)` uses a monotonic end timestamp, so backgrounding does not drift. "Sit down" moves into the primary position and is the only primary action. Calm visuals only (slow ring, no urgency, no flashing).
  - "Sit down" is visible and enabled in both states, always.
  - Length: `settings.standCountdownSec`, bounded by `STAND_COUNTDOWN = { min: 15, max: 60, default: 30 }` in `domain/tasks/standCountdown.ts` with `clampStandCountdown(value)`. Settings uses a stepper in 5-second steps inside the range, and stored values are clamped when loaded. **Her physio should confirm this range before release.**
- Step 4: victory screen via the shared `CelebrationOverlay` (variant taskComplete with the Stand card). The Stand card is played through this flow: from Home ("Play card" or tapping the Stand card) and from Move.
- Copy examples: "Call your helper", "Brakes on, feet flat, helper beside me", "Stand tall with your helper. You're doing great.", "Well done, you did it with help!". Review in the tone audit (G4).

## 16. Exercises (R5)

`data/exercises.ts`:
```ts
interface Exercise { id: string; nameKey: StringKey; durationSec: number; lottie: number /* require() */; instructionKey: StringKey; }
```
The real exercise list will be supplied later. The app ships with 3 clearly labelled placeholder entries ("Exercise 1" to "Exercise 3", 20 seconds each) so the flow can be built and tested. Adding an exercise is one entry in `data/exercises.ts` plus its strings and a Lottie file. Placeholder Lottie files share one looping animation until final ones are supplied; replacing a file needs no code change.
`ExerciseSession` runs a reducer (`index`, `remaining`, `status`, `playedIds`). A `CardProgressBar` along the top shows one small card per exercise that flips to gold when played. Finishing the last one queues the task-complete celebration with a "Session complete" headline.

## 17. Solitaire engine (`domain/solitaire`)

### Types
```ts
type Suit = 'S' | 'H' | 'D' | 'C'; type Rank = 1..13;
interface Card { id: number /* 0-51 */; suit: Suit; rank: Rank; faceUp: boolean; }
interface GameState {
  stock: Card[]; waste: Card[];
  foundations: Record<Suit, Card[]>;
  tableau: Card[][];                   // 7 columns, bottom -> top
  moves: number; status: 'playing' | 'won';
}
type Location =
  | { zone: 'waste' } | { zone: 'foundation'; suit: Suit }
  | { zone: 'tableau'; col: number; index: number };
type Move =
  | { type: 'draw' } | { type: 'recycle' }
  | { type: 'move'; from: Location; to: Location };
```
(The Solitaire `Rank` is the card rank 1-13 and is unrelated to the player rank `Rank` in progression; the player rank type is named `PlayerRank` in code to avoid confusion.)

### Functions (pure; immutable state)
- `createDeck()`, `shuffle(deck, seed)` (mulberry32 from `domain/shared/rng.ts` + Fisher-Yates), `deal(seed)` (tableau 1..7, top face-up, 24 in stock). `DEAL_ALGORITHM_VERSION` is a constant that must be bumped whenever `shuffle` or `deal` changes, because every stored seed depends on them.
- `getLegalMoves`, `isLegalMove`, `applyMove` (auto-flip exposed card; `draw` moves top stock to waste; `recycle` only when stock is empty).
- `findBestMove(state, from)` for tap-to-move. Priority: foundation; then a tableau column that exposes a face-down card or empties a column; then any other legal tableau move preferring the longest column. Kings go to an empty column only when it unblocks something, or when it is the only option.
- `hint(state)` ranks foundation moves, then moves that reveal face-down cards, then draw. It returns `null` when only stock cycling without progress remains.
- `isWon`, `hasMoves` (cycle check after a full stock pass).
- **Finish for me** (`autoFinish.ts`): `canAutoFinish(state)` is true when every tableau card is face-up and the stock and waste are empty. `autoFinish(state): { moves: Move[]; finalState: GameState }` repeatedly moves the lowest available card of each suit to its foundation until all 52 cards are there. With all cards face-up and no stock, this always finishes, so it never fails; for any other state it returns `null`. The UI plays the returned moves with `useMotion()` (fast but readable in `full`, a short cascade in `calm`, an instant jump in `none`), then runs the normal win flow, so the win pays `ECONOMY.solitaireWin.stars` like any win. It is saved before the animation starts (G9).
- Undo: `pushHistory`, `undo` with whole-state snapshots (cap 200). Saves store compact arrays of card ids.

### Solver and winnable seeds
- `solver.ts`: `solve(state, { maxNodes }): { result: 'solvable'; moves: Move[] } | { result: 'unsolvable' } | { result: 'unknown' }`. A deterministic depth-first search over `getLegalMoves`/`applyMove` with a transposition table (a hash of the canonical state), move ordering (foundation moves, then moves that reveal a face-down card, then others, stock last) and a node budget `SOLVER_MAX_NODES`. It sees every card (perfect information), so it proves a deal is winnable, not that a player will find the win. Pure TypeScript with no React imports, so the app, the script and Jest all use it.
- `scripts/generateWinnableSeeds.ts` (run with `npm run seeds:generate`, using `tsx`): tries candidate seeds in a fixed deterministic order, runs `solve`, keeps the ones proven `solvable` (skipping `unsolvable` and `unknown`), stops at 300, and writes `src/data/winnableSeeds.ts`:
```ts
// GENERATED by scripts/generateWinnableSeeds.ts. Do not edit by hand.
export const WINNABLE_SEEDS_DEAL_VERSION = 1;   // equals DEAL_ALGORITHM_VERSION when generated
export const WINNABLE_SEEDS: readonly number[] = [ ... ];
```
  It prints how many seeds were tried, solved and skipped, and the time taken. The generated file is committed; the script is a dev tool and is not part of the app bundle.
- `seeds.ts`: `pickSeed({ winnable, played, randomValue, fallbackSeed }) -> { seed, source: 'verified' | 'random', played }`. It picks a random seed from `winnable` that is not in `played`; when all have been played it clears `played` and starts again; when `winnable` is empty it returns `fallbackSeed` with source `random`. `randomValue` and `fallbackSeed` come from the store (from `Date.now()`), keeping the function pure. `solitaireStore` keeps `playedWinnableSeeds` (`SolitaireMeta`).
- The version check: if `WINNABLE_SEEDS_DEAL_VERSION !== DEAL_ALGORITHM_VERSION`, the list is treated as unusable and the random fallback is used, so a changed shuffle can never serve unwinnable deals silently. The unit test also fails in that case.
- Because a verified seed means winnable with every card known, she can still lose a game by playing a different move. Undo (up to 200 moves back) stays available. A hint powered by the solver is a possible later feature and is not part of this spec.

### UI layer
- `CardView` (cream face-up card with large rank and suit symbol, never colour alone; back uses the equipped card back). 7-column layout from window width with dynamic tableau overlap. Table colour is the equipped table.
- Tap-to-move: card press -> `findBestMove` -> `applyMove`; if null, a gentle shake (still highlight when reduced) and a kind message.
- Drag (optional): Gesture Handler `Pan` + Reanimated shared values; illegal drops spring back; tap always works.
- Bottom bar: Undo, Hint, New Game (72dp each). WHEN `canAutoFinish` is true, a big "Finish for me" button appears at the primary position.
- Win: `isWon` -> `rewardsStore.awardWin()` (`ECONOMY.solitaireWin.stars` saved first) -> clear save -> queue `win` celebration -> `Win` screen.
- Resume: `solitaireStore` hydrates the save; the Play tile shows "Continue".

## 18. Play arcade (R6)

Lobby of glossy tiles in a 2-column grid. The Solitaire tile shows its ticket cost (`ECONOMY.costs.solitaireGameTickets`) and a "Continue" state. Block Puzzle and Mahjong tiles are locked and labelled "Coming soon", with no star price; they are display-only and nothing is spent. No-ticket state shows Ace (thinking) with a friendly line and a "Back to Home" button as the primary action.

## 19. Rewards tab (R9)

- The 9 purchasable items plus the two defaults are listed in `data/collection.ts`; the grid groups them by theme.
- Sections: "Next reward" progress bar (stars toward the cheapest locked item; item prices come from `ECONOMY.itemPrices` by tier, the cheapest being 50), My Collection grid (card backs, table colours), Medals shelf.
- Medals are defined in `data/medals.ts` (id, name key, description key), earned via `domain/rewards/medals.ts` `evaluateMedals`. Unearned medals show as neutral silhouettes with no wording about failure.
- "New!" ribbon on items in `newlyUnlockedItemIds`; cleared by `markSeen` when she views the item detail or equips it.

## 20. Strings (`src/strings/en.ts`)

A single typed object grouped by area (`common`, `home`, `tasks`, `mascot`, `notifications`, `standWithHelp`, `exercises`, `play`, `solitaire`, `rewards`, `path`, `celebrations`, `settings`, `help`, `onboarding`). `StringKey` derives from it. Small functions handle plurals and interpolation. No `t()` yet; a future i18n tool can wrap the object.

## 21. Error handling and tone

- Failures (cannot open dialer, permission denied, storage read failure) show warm Ace copy and one next step. No stack traces or codes.
- Corrupted persisted state falls back to defaults for that store only.
- A top-level error boundary shows Ace with "Let's start fresh" and a reload button. No data is deleted without confirmation.

## 22. Testing approach

Per `testing.md`: Jest + ts-jest for `src/domain/**` only, coverage 90%, including `autoFinish` (not available, available, always ends in 52 foundation cards, every suit) and `clampStandCountdown`. Seeded RNG makes deals and prizes deterministic. Every seed in `winnableSeeds.ts` is re-checked by the solver in a unit test, and each solution the solver returns is replayed through `applyMove` to confirm it reaches a win. If that test is too slow for routine runs, it stays in `npm test` but the node budget per seed is tightened, and the first fallback is to store each seed's solution in the generated file and replay it (decided in task 12). Notifications, Linking, animations and UI are checked manually on a device (checklists in the tasks).

## 23. Security and privacy

No INTERNET permission in the release manifest (blocked in release only, since dev builds need it for Metro). No analytics or crash SDKs. `allowBackup=false`. No purchases, ads or gambling mechanics: all prizes are free and a reveal always yields a prize.

## 24. Updates and signing (task 15.7)

- There are no over-the-air updates (`expo-updates` is not installed). A new version is built offline on the owner's computer and installed over the existing app on her phone (for example a release APK installed over the old one, or `adb install -r`).
- Android keeps an app's data on an update only if the new build has the **same application id (`com.candice.momspace`) and the same signing key**. So every build that goes onto her phone, including test builds, is signed with one release keystore created at the start. The keystore and its password are backed up somewhere safe outside the repository; losing it means the phone must uninstall the app and she loses her data.
- `android:allowBackup="false"` means a fresh install starts empty, which is why preserving data depends on updates over the top of the old app.
- The version code increases with every build.
- A short written procedure (build, install, check the data survived) goes in `docs/` in task 15.7.

## 25. Mockup reconciliation (visual references)

Six mockups are in `.kiro/specs/moms-aces/designs/` (`home`, `move_hub`, `path`, `play`, `royal_flush`, `task_completed`). Task 1.11 copies them to `docs/design/`. More screens (Play lobby, Solitaire, Win, Stand With Help, exercises) will be added later. They set the look: dark velvet, gold buttons, Ace in a speech bubble, rewards strip, bottom tabs. The decisions, after the owner's review:

| Mockup | What it shows | Decision |
| --- | --- | --- |
| Home | Featured card plus a row of 4 small cards | **Adopted** (section 12). |
| Home, all screens | Buttons "Help" and "Play card" | **Adopted**: "Help" and "Play card" everywhere. The guide screen's title stays "Where am I?". |
| Home | No "Later" button | Spec wins: "Later" stays. |
| Home | Green dot on "Due now" | Gold. Green is only for "Done" checks. |
| Home | Times "10:30 AM" | Adopted: 12-hour display through `formatTime`. |
| Home | Sample data (Water featured and also played; Stretch 1:00 PM) | Sample only. Real data from `handState` and settings; a played card is never "Due now". |
| Home | "Royal Flush" chip with a gift icon | Closed chest showing only "?". |
| Path | Chest amounts ("+1 Ticket, 50 Stars", "+250 Stars"), King reward "+3 Tickets and Card Back" | Placeholders only. Chest nodes say "Mystery card" with no amounts. A new rank adds 1 mystery card (`ECONOMY.newRank`). |
| Path | "Parlor Chest, Unlocked!" with a padlock | "Chest ready to open" only while a card waits; otherwise a normal node; no padlock. |
| Path | Fewer chests than every 10 steps | Spec keeps a chest node every 10 steps; spacing is set when the screen is built. |
| Path, Move | "Mom's token", "Queen Mom" written in | Built from `displayName`. |
| Move | Two "Play card" buttons | Accepted: each is the only action of its own card. Seated Exercises is gold-toned, Stand With Help burgundy, as drawn. |
| Move | "Daily move bonus" banner | Heading only: no reward, no counter. Rewards, "3 mins", "4 safe steps" come from `ECONOMY` and the data. |
| Play | "+25 Stars" for a win | 15 stars, read from `ECONOMY`. |
| Play | Card Match, Royal Puzzle, Spiders & Aces | Ignored. Block Puzzle and Mahjong stay as "Coming soon" tiles (games she already plays). |
| Royal Flush | Star overlaps the title; fanned cards cover each other's indices; no bonus chips | R18.7 applies. Bonus chips (+2 tickets, +20 stars) added above the chest. |
| Task completed | Bottom-right index upside down (reads like "V") | Both indices upright. |
| Large text | No large-text mockup | R12.9 and the accessibility audit apply. |
