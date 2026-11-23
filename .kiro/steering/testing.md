---
inclusion: always
---

# Testing

## Scope
Jest tests are REQUIRED for every module in `src/domain`. UI is not unit-tested in this project (manual device checks instead).

## Required coverage
- **solitaire**: `canAutoFinish` (false with a face-down card or any stock/waste card, true otherwise) and `autoFinish` (always ends with 52 cards on the foundations, moves replay to a win, null when unavailable); solver (solvable, unsolvable and unknown positions; every returned solution replays to a win); every seed in `src/data/winnableSeeds.ts` is solvable and the list version matches `DEAL_ALGORITHM_VERSION`; `pickSeed` (unplayed seed, cycle when all played, random fallback for an empty or stale list); deck has 52 unique cards; seeded shuffle is deterministic and different seeds differ; deal layout (1..7 tableau, 24 stock); valid-move rules (alternating colours descending for tableau, same suit ascending for foundations, only Kings to empty columns, face-up sequences); auto-move "best spot" selection; apply move incl. auto-flip of the exposed card; stock draw 1 and recycle of waste; undo restores exact prior state (including after flips and recycles); hint returns a valid move or null; win detection; no-moves detection. Prefer table-driven tests and one full seeded game that is known to be winnable.
- **rewards**: task-card reward (1 ticket, 5 stars) and Royal Flush reward amounts come from `ECONOMY`; ticket spend (cannot go below 0); star award on win; unlock rules (enough stars, no double unlock, no spending below 0); equip only unlocked items; daily progress; "days this week" never negative.
- **reminders**: `buildSchedule` for the default per-task times (sorted, `firstOfDay` marking); `validateReminderTimes` (bad format, duplicates, two at the same minute, more than 3 per task); snooze time computation; `formatTime(time, clock)` in both `'12h'` and `'24h'` (midnight, noon, single-digit hours and minutes; R2.22).
- **tasks**: `resolveDone` (first Done, Stretch and Stand never complete from it, extra Water stars are given only for a Water notification, stop at the daily cap and are never given for a Home tap, every repeat returns a message and never awards tickets, path steps or Royal Flush credit); `handState` `next` card (none due, several due, snoozed, all played; clock shown for not-yet-due); `clampStandCountdown` (below, inside and above 15 to 60); completion and snooze transitions; rollover of missed tasks; hand state (played cards, next card); one play per task per day (a repeat completion awards nothing); each task's card is due from its earliest reminder time.
- **rewards / mystery prizes**: a reveal gives exactly one prize and removes the pending card; `pickPrize` is deterministic for a seed; weights respected over many seeds (within tolerance); owned items are never chosen; fallback prize when no items remain; a pending card's prize does not change on reload; "New!" tracking set and cleared; medals.
- **progression**: path position never decreases; rank and level boundaries; rank-up detection; milestones granted once; a mystery card for each new rank (Queen, King, Ace) granted once and never for a level; at each of steps 100, 200 and 300 exactly two mystery cards are created (the milestone chest and the new-rank card); `pathNodes` (start, level, rank and chest nodes at the right steps); "days this week" lit days, silent weekly reset, never negative.
- **economy**: `economy.ts` invariants (non-negative integers, positive weights, prices ascend by tier, cheapest price is the minimum). Tests import amounts from `ECONOMY` instead of writing numbers, so retuning never breaks them.
- **Royal Flush**: eligible only when all 4 tasks are played; only once per day (claimed date); not eligible on a new day until all 4 are played again.

## Rules
- Domain tests live next to code: `src/domain/<module>/__tests__/*.test.ts`.
- Tests are deterministic: inject time and seed, never use real clocks or `Math.random`.
- The winnable-seeds test may be slow. Measure it in task 12 and keep it in `npm test`, tightening the solver node budget if needed.
- Run `npm test` and `npm run typecheck` and `npm run lint` before finishing any task. From task 15.4, also run `npm run check:copy` (no "streak" in any copy).
- Coverage target for `src/domain`: 90% lines.
- Fix failing tests by fixing code, not by weakening assertions.
