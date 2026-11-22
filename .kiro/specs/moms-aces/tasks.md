# Tasks: Mom's Aces

Status: APPROVED (v5). No open questions. Do not start any task until the owner says "start task 1". Nothing has been started: no task from v1 was completed, so none is redone.
No feature code is written until this spec is approved.

Every task must finish with `npm run typecheck`, `npm run lint` and `npm test` passing, and must follow `.kiro/steering/`. "Req" lists the requirements in `requirements.md` that the task satisfies. UI tasks end with the accessibility checklist and a Calm mode check.

## 1. Scaffold, theme, strings, navigation shell
Order: do 1.1, then **1.9 as a gate** (versions pinned, `npx expo-doctor` passes, a development build starts on a device or emulator), then 1.2 to 1.8, 1.10 and 1.11. Nothing else is built on top until 1.9 passes. If MMKV v4 or Nitro causes any problem, stop and report it with the proposed fallback (AsyncStorage behind the same `services/storage.ts` adapter, design section 5). Do not work around it silently.
- [x] 1.1 Create the Expo app (TypeScript template) in the repo root, app name "Mom's Aces", Android only, application id `com.candice.momspace`, add `expo-dev-client`, `strict: true`. Pin Expo SDK 56.0.24 exactly (`.npmrc` `save-exact=true`, lockfile committed). Req: R13.1, G8
- [x] 1.2 Add ESLint, Prettier, `@/` alias (tsconfig, babel module-resolver, Jest mapper), and the `no-restricted-imports` rule for `src/domain/**`. Scripts `lint`, `typecheck`, `test`, `format`. Req: R13.1, R13.3
- [x] 1.3 Add Jest with ts-jest and one smoke test in `src/domain`. Req: R13.2
- [x] 1.4 Create `src/theme`: new palette (burgundy, purple, magenta, gold + highlight, cream, velvet, velvetRaised; dark theme only), typography, spacing, radii, touch, textScale, and motion tokens (durations, easing, effect counts, glow). Add `useTheme()`. Bundle Playfair Display and Nunito and load before first render. Req: R12.2, R12.3, R19.4
- [x] 1.5 Create `useMotion()` with levels full, calm and none (reads `calmMode` setting default, system reduce-motion). Stub the setting until task 2. Req: R19.2-R19.4
- [x] 1.6 Create `src/strings/en.ts` with the grouped structure (including `mascot` and `celebrations`) and `StringKey`. Req: G2, R14.4
- [x] 1.7 Create typed navigation: root stack, 4 bottom tabs (Home, Move, Play, Rewards) with labelled icons, placeholder screens including Path, `ScreenFrame`, `BigButton`, `IconButton`, `HelpButton` stub. Req: G5, G6, R11.1, R12.1, R15.3
- [x] 1.8 Android config: package id, release-only removal of INTERNET permission, `allowBackup=false`, permissions list. Verify the merged release manifest has no INTERNET permission and the debug one does (the development build itself is verified in 1.9). Req: G1
- [ ] 1.9 **Gate (NOT PASSED, work stopped for the owner's decision).** Result so far: `npx expo install --check` passes and 21 of 22 `expo-doctor` checks pass. The failing check is "Hermes V1 regressions": Expo SDK 56.0.24 (React Native 0.85.3, Hermes V1 250829098.0.10) has a known memory regression for apps that import react-native-reanimated or react-native-worklets; the fix ships in Expo SDK 57.0.9 or later (React Native 0.86.2 or later). The development build has not been attempted. Install with `npx expo install` and pin exactly the versions listed in `.kiro/steering/tech.md`: reanimated, worklets, gesture-handler, lottie-react-native, expo-notifications, react-native-svg, `react-native-mmkv` 4.3.2 and `react-native-nitro-modules` 0.35.9. `npx expo install --check` and `npx expo-doctor` must pass, and a development build must start on a device or emulator (this is the gate for everything else). Req: R13.1
- [ ] 1.10 App icon (adaptive: burgundy background, gold "A" card foreground) and splash screen using the Ace art. Req: R12.8
- [ ] 1.11 Add `docs/design/` with the Stitch screenshots as visual references (copy the six files from `.kiro/specs/moms-aces/designs/`: home, move_hub, path, play, royal_flush, task_completed; add the large-text Move mockup if the owner supplies one), and reference that folder in the steering files. Where a mockup's wording or behaviour differs from the spec (for example any "streak" label), the spec wins; list any mockup elements that are not in the spec and ask the owner before building them (see design section 25). Req: R12.1, G11

## 2. Zustand + MMKV persistence
- [ ] 2.1 Implement `services/storage.ts` (MMKV v4 `createMMKV` instance, `remove` for deletes, and the Zustand `StateStorage` adapter). Req: G1, G7
- [ ] 2.2 Create stores with `persist`, `version`, `migrate`, `partialize`: settings (including `calmMode` and `displayName`), progress (rank, rankLevel, pathPosition, dailyRoyalFlushClaimedOn, royalFlushSeenOn, `daysThisWeek`, medals, claimedMilestones, `claimedRankUps`, `extraWaterStars` on today's water day), rewards (tickets, stars, unlockedItems, equipped, pendingMysteryRewards, lastRevealedPrize, newlyUnlockedItemIds), solitaire save and `playedWinnableSeeds`. Req: G7, R7.15, R10.5, R15, R16, R17, R19.1
- [ ] 2.3 Add safe hydration (corrupt data falls back to defaults per store) and a "hydrated" gate in the app root. Req: G7
- [ ] 2.4 Add `services/backup.ts` stub with `exportBackup`/`importBackup` and `BACKUP_STORE_KEYS`, documented as a future extension point. Req: R10.5
- [ ] 2.5 Connect `useMotion()` to the settings store. Req: R19.1, R19.3

## 3. Domain logic + tests
- [ ] 3.1 `domain/tasks` (also a test that a played card is never `next` and never due for display): definitions, `DEFAULT_REMINDER_TIMES`, `handState` (due times, `isDue`, `next` as in design section 6), `resolveDone` (played, openFlow, guide, repeat messages, and `extraWater` only for a Water notification up to the daily cap), `homeFocus` rules, `standCountdown.ts` (`STAND_COUNTDOWN` 15/60/30 and `clampStandCountdown`), `completeTask` (idempotent), `snoozeTask`, rollover. Tests: next card with none due, all due, snoozed, all played; Stretch and Stand never complete from `resolveDone`; extra water stops at the cap and is never given for a Home tap; no repeat ever awards tickets, path steps or Royal Flush credit; every repeat returns a message; `clampStandCountdown` below, inside and above the range. Req: R1.7, R1.8, R1.12, R1.15, R1.16, R3.1, R3.3, R3.6, R3.7, R4.5, R10.7, G10
- [ ] 3.2 `domain/reminders`: `buildSchedule`, `validateReminderTimes`, snooze time. Tests (default times, sorting, `firstOfDay`, invalid format, duplicates, two reminders at the same minute, more than 3 per task). Req: R2.1, R2.2, R2.13, R2.15, R2.17
- [ ] 3.3 `domain/rewards/economy.ts`: all reward numbers, costs and prices (design section 8) and an invariants test. Req: R3.8, R8.1, R9.12
- [ ] 3.3b `domain/rewards`: ticket award/spend, star award, unlock/equip rules, "New!" tracking (`markSeen`), amounts taken from `ECONOMY`. Tests. Req: R3, R8.1, R9.3, R9.5, R9.7, R9.11
- [ ] 3.4 `domain/rewards/prizes.ts`: `pickPrize` (weighted, seedable, owned-item filtering, fallback), `createPendingMystery`, `revealMystery`. Shared seeded RNG in `domain/shared/rng.ts`. Tests: determinism per seed, weights over many seeds, owned items never chosen, fallback when nothing left, no reroll after reload, exactly one prize per reveal and the pending card removed. Amounts and weights come from `ECONOMY`. Req: R17
- [ ] 3.5 `domain/progression`: `advance`, `rankFromPosition`, `didRankUp`, `milestonesCrossed`, `isRoyalFlushEligible`, `newRanksReached` (Queen, King, Ace only, once each, not each level), `pathNodes` (rank, level and chest nodes), and "days this week" (`litDays`, `daysThisWeek`, `rollWeek`). Tests: never decreases, rank boundaries, milestone claimed once, once-per-day Royal Flush, node kinds at steps 0, 10, 20, 100, a new-rank card at steps 100, 200 and 300 only and never at level steps, two cards (chest + rank) at step 100, week rollover is silent and non-negative. Req: R15, R16.1, R16.3, R16.5
- [ ] 3.6 `domain/rewards/medals.ts` and `data/medals.ts`. Tests. Req: R9.10
- [ ] 3.7 `data/collection.ts`: 9 purchasable items (per theme: card back tier 1, table colour tier 2, card back tier 3; price from `ECONOMY.itemPrices`) plus a default card back and table colour; and `data/prizes.ts` (table built from `ECONOMY`, no numbers of its own). `economy.ts` values: stars prizes 10 (weight 20) and 25 (weight 8), item weight 2, fallback 10, no mini-game unlock price. Req: R9.1, R9.8, R9.12, R9.13, R17.3
- [ ] 3.8 Wire domain into store actions (`playCard`, `snooze`, `spendTicket`, `awardWin`, `unlock`, `equip`, `claimRoyalFlush` (2 tickets, 20 stars, 2 path steps and one pending mystery card from `ECONOMY`), new-rank mystery card (`ECONOMY.newRank`), `revealMystery`), saving rewards before queueing any celebration. Req: G9, R3, R16, R17

## 4. Mascot and celebration system
- [ ] 4.1 `Mascot` component (poses waving, cheering, thinking, sleeping; speech bubble; still pose when motion is none). Use the supplied Ace art as the base mascot: a single pose for now, with every pose key mapped to it until the other poses are supplied. Req: R14.1, R14.2
- [ ] 4.2 Mascot string pools (lines take the display name as a parameter) and `pickLine`; `useDisplayName()`. Req: R14.4, R14.8, G2
- [ ] 4.3 `celebrationStore` (queue with priority order) and `CelebrationHost` at the root. Req: R18.3
- [ ] 4.4 `CelebrationOverlay` shell (backdrop, Ace, headline, content slot, big "Collect" button at the standard primary position) and `Confetti` driven by `useMotion()`. Req: R18.1, R18.2, R18.5, R18.6
- [ ] 4.5 Variants: `TaskComplete` (flip to Ace, confetti, ticket and stars fly to their counters via the `RewardTargets` registry), `RankUp`, `Win`, `AceMessage` (repeat Done, optional "+1 star" chip), plus placeholders for `RoyalFlush` and `MysteryReveal`. Static end state for every variant. Req: R3.2, R3.5, R12.6, R18
- [ ] 4.6 Debug-only gallery screen (dev builds) to preview each celebration in full, calm and none levels. Req: R19
- [ ] 4.7 Manual check: no flashing, readable static end states, Calm mode and system "remove animations" honoured. On the task-complete screen, decorations never overlap the title or subtitle and the card corner indices are never clipped (also at the largest text size). Req: R19.2, R19.3, R18.5, R18.7

## 5. Home: Today's Hand
- [ ] 5.1 `FeaturedCard` (task icon, name, due-time chip, gold "Due now" or "Due at <time>", reward chips from `ECONOMY`, gold border, glow only in `full`), `MiniCard` and `HandRow` (icon, label, gold tick when played, clock and due time when pending, NEXT highlighted, no padlock, each a labelled button), all fed from one `handState`; `formatTime` (12-hour). Req: R1.1-R1.4, R1.12, R1.13, R1.15, R1.17
- [ ] 5.2 Rewards strip: `TicketCounter`, `StarCounter`, `RankBadge` (opens Path). Register counter positions in `RewardTargets`. Req: R9.9 (strip), R15.2, R15.3
- [ ] 5.3 Progress strip "X of 4 cards played" leading to a closed chest showing only a "?". Req: R1.9, R16.2
- [ ] 5.4 Home screen: Ace with speech bubble (sleeping before her first reminder while the next card still shows its clock; waving with "all caught up" when all 4 are played, with the golden "All played today" card and a single "Go to Play" button), `homeFocus` card from a notification, "Play card" (primary) and "Later" (secondary), all-caught-up and sleeping states, new-day deal, quiet rollover. Req: R1.5-R1.8, R1.10, R1.11, R1.14, R1.15, R1.18, R14.6
- [ ] 5.4b Card taps: featured card = "Play card"; another pending small card asks "Play the <name> card now?" once; a played card gives an Ace message and no stars. Req: R1.13, R1.16
- [ ] 5.5 Hook "Play card" to `playCard`: Water and Bathroom complete with the task-complete celebration; Stretch opens the Exercise Session; Stand opens Stand With Help. Show `AceMessage` for repeat Done and `extraWater`. Trigger rank-up and Royal Flush queueing from store results. Req: R1.7, R3, R3.7, R15.5, R16.1, G10
- [ ] 5.6 Manual check against the accessibility checklist, at xlarge text and in Calm mode. Req: R12.1

## 6. Reminders
- [ ] 6.1 `services/notifications.ts`: channels (sound and silent), two categories (`reminder-done`: Done and Later for Water and Bathroom; `reminder-start`: Start and Later for Stretch and Stand), every action `opensAppToForeground: true`, `syncReminders` using `buildSchedule`, one-off snooze scheduling. Req: R2.3-R2.8, R2.12
- [ ] 6.2 Mascot notification copy ("Ace says: time for water, Mom!", name from `displayName`) in strings and the notification small icon (crown-card silhouette); verify what Android allows for a full-colour image. Req: R2.6, R14.3
- [ ] 6.3 Response handling (`handleNotificationResponse`, Done, Start and Later): listener registered at module load, `getLastNotificationResponseAsync` at launch, handled-key log in MMKV, sort by response timestamp, process each the platform delivers exactly once via `resolveDone`/`snoozeTask` (set `homeFocus` for Start), then route to Home through `navigationRef` (queued until ready). Body tap opens Home. Req: R2.7, R2.8, R2.14, R2.18, R2.19, R16.4
- [ ] 6.4 `services/permissions.ts` and the friendly Permissions screen with Ace, with denied-state handling. Req: R2.9, R2.10
- [ ] 6.5 Sync on launch and on every relevant settings change, including `displayName`. Req: R2.4, R2.5, R2.21
- [ ] 6.6 Check on a device which timestamps expo-notifications gives on a response, and adjust the ordering rule in design section 13 if needed. Req: R2.19
- [ ] 6.7 **Acceptance, on a real Samsung phone** (not an emulator). Req: R2.6-R2.8, R2.18-R2.20
  - [ ] Reminders arrive at their scheduled times with the app open, with the app in the background, after the app is swiped away from recent apps, and after the phone is restarted.
  - [ ] Done (Water, Bathroom), Start (Stretch, Stand) and Later each open the app to Home in all four cases above, and the right result shows (celebration, Ace message, or Ace's invitation with that card next).
  - [ ] Tapping the notification body opens Home.
  - [ ] Two notifications actioned one after the other are each processed exactly once, in time order.
  - [ ] Exact-alarm behaviour is noted, and the exact Samsung menu names and steps ("Put unused apps to sleep", "Sleeping apps", "Deep sleeping apps", "Never sleeping apps") are written down with screenshots for task 15.3.
  - [ ] Result recorded in this file with the phone model and Android version. (Manual "Force stop" is excluded, R2.20.)
- [ ] 6.8 **Checkpoint.** After 6.5, install a build on her phone (task 15.7 procedure, same application id and signing key) and run the 6.7 reminder acceptance over several days while later tasks continue. Record the results here. Req: R2.20

## 7. Settings
- [ ] 7.1 Settings screen layout with large controls: the name Ace calls her, reminder times (one large time control per reminder), sound, text size, stand countdown length (a stepper in 5-second steps from 15 to 60, default 30, from `STAND_COUNTDOWN`). Req: R10.1, R10.2, R10.4, R10.7
- [ ] 7.1b `displayName` field: trim, 20 characters, "Mom" if empty, reschedules notifications. Req: R10.5, R14.8, R2.21
- [ ] 7.2 Calm mode / Reduce motion toggle (off by default) applied immediately app-wide, with a short explanation from Ace. Req: R10.2, R19.1, R19.2
- [ ] 7.3 Helper phone number input with validation and save. Req: R10.3
- [ ] 7.4 "How does this work?" entry and links to permissions and battery guidance. Req: R10.2, R11.4
- [ ] 7.5 Text scale applied app-wide; verify layouts at xlarge. Req: R10.4, R12.4

## 8. Stand With Help (game-level styling)
- [ ] 8.1 `services/calling.ts` (`tel:` and optional `wa.me`) with failure handling. Req: R4.2
- [ ] 8.2 `LevelTrack` progress component and step 1: "Call for help" (only opens the dialer, never advances; no-number prompt) and a big "My helper is here" button at the primary position that goes to step 2. Req: R4.1-R4.3
- [ ] 8.3 Step 2 checklist with tick animations, "Next" gated on all three. Req: R4.4, R4.8
- [ ] 8.4 Step 3: a big "Start" button the helper taps (the countdown never starts on screen entry), then the countdown (`useCountdown`); "Sit down" visible and enabled before and after Start; calm visuals. Add a note in the screen code and in this file that her physio should confirm the 15 to 60 second range. Req: R4.5, R4.6, R10.7
- [ ] 8.5 Step 4 victory screen via the celebration system; Stand card plays and the task-card reward (R3.1) is awarded. Req: R4.7, R3.1
- [ ] 8.6 Entry points from Move and from the Stand card on Home ("Play card" or tapping the featured or mini card). Req: R4.9, R1.7
- [ ] 8.7 Copy and visual review so nothing implies standing alone, in all motion levels. Req: G4, R4.8

## 9. Exercises (card progress bar)
- [ ] 9.1 `data/exercises.ts` with 3 placeholder exercises (the real list comes later) and placeholder Lottie files. Req: R5.1, R5.8
- [ ] 9.2 Move tab and ExerciseList screen. Req: R5.2
- [ ] 9.3 `CardProgressBar` (small cards flip to gold as exercises complete). Req: R5.4
- [ ] 9.4 ExerciseSession: looping Lottie (still in reduced motion), name, instruction, countdown ring, Next, Stop, auto-advance. Req: R5.3, R5.5, R5.9
- [ ] 9.5 "Session complete" celebration, task-card reward (R3.1) and Stretch card played; Stop returns kindly with no reward. Req: R5.6, R5.7

## 10. Royal Flush and Mystery reveal
- [ ] 10.1 `RoyalFlush` celebration variant: bonus chips (+2 tickets, +20 stars from `ECONOMY`), then a closed chest showing only "?", opening it queues `MysteryReveal`, "Collect". Check that nothing in the UI or accessibility labels reveals the contents. Req: R16.1, R16.2, R16.6, R16.7
- [ ] 10.2 `MysteryReveal` variant: shimmering card, single tap to reveal, prize display, "New!" ribbon, "Collect". Req: R17.1, R17.2, R17.7, R17.8
- [ ] 10.3 Royal Flush trigger: 4th distinct task played -> claim once per day, award 2 tickets, 20 stars and 2 path steps from `ECONOMY`, create 1 pending mystery card. Req: R16.3, R16.7, R17.5, R17.6
- [ ] 10.4 Launch recovery: show an unseen Royal Flush and pending mystery cards after launch; Home tile if a mystery card is waiting. Req: R16.4, R17.6, G9
- [ ] 10.5 Manual check of both flows in full, calm and none levels. On the Royal Flush screen, decorations never overlap the title or subtitle and the card corner indices are never clipped (also at the largest text size). Req: R19, R18.7

## 11. Path screen
- [ ] 11.1 Path screen: `pathNodes` data and a winding path drawn with `react-native-svg` in a `FlatList`, with rank nodes, the 5 level nodes within each rank, a chest node every 10 steps, the token at her position, and a labelled "Where I am" button. Chest nodes are labelled "Mystery card" with no amounts; a node shows "Chest ready to open" only while a mystery card for it is waiting, and opens the reveal when tapped. Req: R15.4, R15.11, R15.12
- [ ] 11.2 Token advance animation (static jump when reduced), rank-up celebration when crossing a rank or level. Req: R15.5
- [ ] 11.3 Milestone chests create pending mystery cards. Req: R15.7
- [ ] 11.4 "N days this week" as lit hearts/candles, positive-only, silent weekly reset, no use of the word "streak". Req: R15.8, R15.9
- [ ] 11.5 Check: no negative states for missed days, 1 tap from Home. Req: R15.6, G3, G6

## 12. Solitaire, Play arcade, Win
- [ ] 12.1 Engine: types, deck, seeded shuffle (using `domain/shared/rng.ts`), deal, `DEAL_ALGORITHM_VERSION`. Tests. Req: R7.1, R7.14
- [ ] 12.2 Engine: legal moves, `applyMove` (auto-flip, draw, recycle), win detection. Tests. Req: R7.6, R7.12, R7.14
- [ ] 12.3 Engine: `findBestMove`, `hint`, `hasMoves`. Tests. Req: R7.3, R7.9, R7.13
- [ ] 12.3b Engine: `canAutoFinish` and `autoFinish` (all tableau cards face-up, stock and waste empty). Tests: not available when a card is face-down or stock/waste has cards, available otherwise, ends with 52 foundation cards for each suit arrangement, move list replays to a win, returns null when unavailable. Req: R7.18, R7.19
- [ ] 12.4 Engine: undo history with cap. Tests (including after flips and recycles). Req: R7.8
- [ ] 12.5 `solver.ts`: deterministic search with transposition table and node budget. Tests on small hand-built positions (solvable, unsolvable, unknown) and replay of every returned solution through `applyMove` to a win. Req: R7.16, R7.14
- [ ] 12.5b `scripts/generateWinnableSeeds.ts` (+ `tsx`, `npm run seeds:generate`): produce `src/data/winnableSeeds.ts` with about 300 proven seeds and the deal version; commit the generated file. Req: R7.15, R7.16
- [ ] 12.5c `seeds.ts` `pickSeed` (unplayed seed, cycle when all played, random fallback when the list is empty or its version is stale). Tests. Req: R7.15
- [ ] 12.5d Unit test that every seed in `winnableSeeds.ts` is solvable and the version matches. Measure the run time; if it is too slow for routine runs, tighten the node budget or store solutions and replay them (design section 22). Req: R7.17
- [ ] 12.6 `solitaireStore` save/resume with compact serialisation, `seedSource`, and `playedWinnableSeeds`; new games use `pickSeed`. Req: R7.11, R7.15
- [ ] 12.7 UI: `CardView`, responsive layout, equipped card back and table. Req: R7.2, R9.6
- [ ] 12.8 UI: tap-to-move, gentle no-move feedback, stock draw/recycle. Req: R7.3, R7.4, R7.6
- [ ] 12.9 UI: Undo, Hint, New Game (calm confirm) bar, and the big "Finish for me" button when `canAutoFinish` is true; it plays the moves with `useMotion()` and then runs the normal win flow. Req: R7.7-R7.10, R7.18
- [ ] 12.10 UI: optional drag with gesture-handler + reanimated; tap always works. Req: R7.5
- [ ] 12.11 Play arcade tab: glossy tiles, Solitaire (cost from `ECONOMY`, Continue), locked Block Puzzle and Mahjong tiles labelled "Coming soon" with no star price, no-ticket state with Ace. Req: R6
- [ ] 12.12 Ticket spent once on new game only; none for resume or Undo. Req: R6.4, R6.5, R6.7
- [ ] 12.13 Win: 15 stars from `ECONOMY` awarded and saved, `Win` celebration, Win screen with medals earned. Req: R7.12, R8
- [ ] 12.14 Manual check of the full loop: task -> ticket -> game -> win -> stars. Req: R3, R6, R8

## 13. Rewards / My Collection + Medals
- [ ] 13.1 Rewards tab: collection grid (9 purchasable items by theme, plus defaults) with silhouettes and costs. Req: R9.1, R9.2, R9.13
- [ ] 13.2 Unlock (confirm dialog) and equip flows, kind insufficient-stars message, "New!" ribbons cleared on view/equip. Req: R9.3-R9.5, R9.11
- [ ] 13.3 "Next reward: N more stars" progress bar (cheapest locked item; prices from `ECONOMY`). Req: R9.9, R9.12
- [ ] 13.4 Medals shelf with neutral locked silhouettes. Req: R9.10
- [ ] 13.5 Assets for the 9 items (per theme a card back at 50 stars, a table colour at 100 stars, a card back at 200 stars) and the default card back and table. Req: R9.1, R9.13

## 14. Welcome, guide, help
- [ ] 14.1 Welcome (Ace waving) and 3-screen guide at first launch, then Permissions. Req: R11.3
- [ ] 14.2 `HelpButton` (label "Help") on every screen opening the 3-step visual guide, titled "Where am I?" (modal). Req: R11.1, R11.2
- [ ] 14.3 Reopen guide from Settings. Req: R11.4

## 15. Polish and audits
- [ ] 15.1 Accessibility audit of every screen using the checklist (targets, 20sp, max text scale, contrast pairs, labels, tap counts). At Large and Extra large text, card titles use the full row width and chips and reward rows stack below the title (compare the large-text Move mockup in `docs/design/`). On the Royal Flush and task-complete screens, decorations never overlap title or subtitle and card corner indices are never clipped. Req: R12.4, R12.9, R18.7, G5, G6
- [ ] 15.2 Reduce-motion audit: every animation honours Calm mode and system "remove animations"; static end states checked; no flashing. Req: R12.6, R18.5, R19
- [ ] 15.3 Battery-optimisation guidance screen with a settings intent and Samsung steps covering "Put unused apps to sleep", the "Sleeping apps" and "Deep sleeping apps" lists, and "Never sleeping apps", using the menu names and screenshots recorded in 6.7. Req: R2.11
- [ ] 15.4 Tone audit of all strings and mascot lines (no scolding, no standing-alone implication, no negative states, repeat messages are warm). Search ALL copy for the word "streak" (case-insensitive), including strings, notification text, mascot lines, asset text and any text derived from the mockups; the word must appear nowhere in the interface (for example use "Daily move bonus", not "Daily streak"). Add an `npm run check:copy` script that fails if "streak" appears under `src/strings` or in any bundled copy file, and run it. Req: G3, G4, G10, G11, R15.8, R20
- [ ] 15.5 Verify no network access (release manifest has no INTERNET permission, no analytics packages) and no gambling/purchase mechanics. Check that all dependency versions still match the pinned list. Req: G1, R20
- [ ] 15.6 Release build (APK/AAB) and on-device acceptance pass. Req: R13
- [ ] 15.7 Document how updates are installed on her phone: an offline build installed over the existing app, with no OTA updates. Every build keeps the same application id (`com.candice.momspace`) and the same signing key (one release keystore, backed up outside the repository, never regenerated) so updates preserve her data. Write the procedure in `docs/` and test it once: install a build, make progress, install a newer build over it, confirm the data is still there. Req: G7

## Out of scope (later)
Backup export/import UI, iOS, more mini-games, additional languages, haptics.
