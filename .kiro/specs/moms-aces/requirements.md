# Requirements: Mom's Aces

Android-only, fully local, English-only app. Tagline: "Every day, a winning hand."
Direction: a polished mobile card game where real-life tasks are disguised as game moves, and every action gives an immediate, visible, free reward.
Requirements use EARS syntax. "The app" is Mom's Aces. "She" is the user. "Ace" is the mascot.

## Global requirements (apply to every feature)

- **G1** The app shall make no network calls and shall store all data on the device only.
- **G2** The app shall take every user-facing string, including mascot speech, from `src/strings/en.ts`.
- **G3** The app shall never display scolding, guilt or "missed" language. Tasks not completed shall roll over quietly, and no screen shall show a negative state for a missed day.
- **G4** The app shall never state or imply that she should stand without a helper.
- **G5** The app shall use touch targets of at least 72dp and body text of at least 20sp, and shall keep the main action in the same place on every screen.
- **G6** The app shall let her reach any feature in no more than 3 taps.
- **G7** The app shall persist state between launches and shall remain usable after the device restarts.
- **G8** The app shall isolate platform-specific code so iOS can be added later without rewriting domain or UI code.
- **G9** The app shall grant every reward when the action happens (saved to the device first), so that closing the app during an animation never loses a reward.
- **G10** The app shall give a friendly response to every tap on "Done", "Start" or on a card. It shall never silently ignore a tap.
- **G11** The word "streak" shall not appear anywhere in the interface, including any text taken from mockups.

## R1 Home: Today's Hand

**User story:** As her, I want my day to feel like a hand of cards, so I know what to do now and feel good doing it.

1. WHEN Home opens, THE app SHALL show one big featured card, which is the NEXT card (R1.15), and beneath it a row of 4 small cards for Water, Bathroom, Stretch and Stand.
2. EACH small card SHALL show its task icon and a short label, and its state: a gold tick when played, or a clock and its due time (for example "1:00 PM") when pending. The small card that is NEXT SHALL be highlighted. A card that is not yet due SHALL NOT show a padlock or any locked state.
3. THE featured card SHALL be larger than the small cards and glowing, with the glow also readable as a static gold border. It SHALL show the task icon, the task name, its due time, a gold "Due now" label (or "Due at <time>" with a clock icon when it is not yet due) and the reward it gives, read from `economy.ts`. THE "Due now" label SHALL NOT use green.
4. WHEN a task is completed, THE app SHALL flip its card into a golden Ace with a sparkle, and its small card SHALL show the gold tick.
5. THE Home screen SHALL show one giant "Play card" button as the single primary action, in the lower-centre/right area.
6. THE Home screen SHALL show a smaller "Later" button that snoozes the next card for 10 minutes.
7. WHEN she taps "Play card", THE app SHALL play the NEXT card. Water and Bathroom SHALL complete at once, with the reward (R3) and the task-complete celebration (R18). Stretch SHALL open the Exercise Session and Stand SHALL open Stand With Help, and each SHALL complete when its flow finishes (R4, R5).
8. WHEN she taps "Later", THE app SHALL snooze that card for 10 minutes (its due time becomes 10 minutes later) and SHALL show the new NEXT card (R1.15), or Ace with a warm "all caught up" message if all 4 cards are played.
9. THE Home screen SHALL show a progress strip reading "X of 4 cards played" leading to a "Royal Flush bonus" chest. THE chest SHALL show a "?" and SHALL NOT show its contents.
10. IF a task is not completed after its reminder time has passed, THEN THE app SHALL keep it available without any warning, count or red colour.
11. WHEN a new day begins, THE app SHALL deal a fresh hand with all 4 cards pending.
12. EACH task SHALL be playable once per day. WHEN a task has already been played today, THE app SHALL not show it as the next card again, and SHALL not award a further ticket, path step or Royal Flush credit for it.
13. WHEN she taps the featured card, THE app SHALL do exactly what "Play card" does. WHEN she taps another pending small card, THE app SHALL ask once, calmly, "Play the <name> card now?" with a big "Yes" and a big "Not yet", and on "Yes" SHALL play that card the same way. Tapping a card SHALL never be the only way to play: "Play card" always works.
14. THE Home screen SHALL show Ace the mascot with a short speech bubble relevant to the next card.
15. THE due time of a pending card SHALL be the earliest reminder time of its task, or the end of its snooze. THE NEXT card SHALL be the pending card with the earliest due time among those already due, or, if none is due yet, the pending card with the earliest due time overall. THE due time SHALL only decide which card is next. ANY pending card SHALL be playable at any time. EXCEPTION: WHEN she opens the app from a notification "Done" or "Start" action, that notification's card SHALL be the NEXT card until she plays it, snoozes it, or plays another card. Whether Ace is asleep or awake is set by R14.6.
16. WHEN she taps a card already played today on Home, THE app SHALL show a friendly Ace message and nothing else. It SHALL NOT award stars, tickets or path steps. (The extra Water star is only for "Done" on a Water notification, R3.7.)
17. THE featured card and the small row SHALL always be drawn from the same hand state. A card that is played SHALL never be shown as "Due now", as NEXT, or as the featured card.
18. WHEN all 4 cards are played, THE featured area SHALL show a golden Ace "All played today" card, "Play card" and "Later" SHALL be replaced by one "Go to Play" button, and Ace SHALL wave with an "all caught up" message.

## R2 Reminders and notifications

**User story:** As her, I want friendly reminders through the day so I don't have to remember.

1. THE app SHALL default to these daily reminders: Water at 09:00, 12:00 and 17:00; Stretch at 10:00; Bathroom at 11:00 and 16:00; Stand at 15:00.
2. THE Settings screen SHALL let her change the reminder time of each reminder, with large time controls and no more than 3 times per task.
3. THE app SHALL schedule one daily-repeating local notification per reminder time.
4. WHEN settings change, THE app SHALL cancel all existing reminders and reschedule from the new settings.
5. WHEN the app launches, THE app SHALL re-sync scheduled notifications with current settings.
6. THE notification SHALL use Ace's voice with friendly text (for example "Ace says: time for water, Mom!"), the Ace-themed notification icon, and two actions. Water and Bathroom notifications SHALL have "Done" and "Later". Stretch and Stand notifications SHALL have "Start" and "Later". BOTH actions SHALL open the app to Home.
7. WHEN she taps "Done" on a Water or Bathroom notification, THE app SHALL open Home and play that card (R1.7, R3.1), or follow R3.7 if the task is already played today. WHEN she taps "Start" on a Stretch or Stand notification, THE app SHALL open Home with that card as the NEXT card and Ace inviting her to play it, and the card SHALL complete only through its guided flow (R4, R5). IF the task is already played today, THEN R3.7 applies.
8. WHEN she taps "Later" on a notification, THE app SHALL snooze that card, schedule a one-off reminder 10 minutes later, open Home, and have Ace confirm warmly.
9. WHEN first needed, THE app SHALL show a simple friendly explanation screen (with Ace) before requesting notification and exact-alarm permissions.
10. IF a permission is denied, THEN THE app SHALL keep working and SHALL show a gentle way to enable it later in Settings.
11. THE app SHALL offer guidance for disabling battery optimisation on Android, with a button opening the relevant system settings. FOR Samsung devices, the guidance SHALL also cover the "Sleeping apps", "Deep sleeping apps" and "Put unused apps to sleep" settings: it SHALL explain how to make sure Mom's Aces is not on those lists and, if the phone offers it, how to add it to "Never sleeping apps". The exact wording SHALL be checked on her phone (task 6.7).
12. WHEN sound is turned off in Settings, THE notifications SHALL be silent.
13. THE schedule-building and validation logic SHALL be pure, deterministic and unit-tested.
14. WHEN a notification action completes the hand, THE app SHALL play the Royal Flush celebration as soon as Home is shown. IF it cannot be shown then, THEN it SHALL be shown on her next visit (R16.4).
15. EACH notification SHALL name exactly one task. THE app SHALL NOT send two reminders at the same minute.
16. WHEN a reminder is for a task she has already played today, THE app SHALL still send it as a gentle nudge. Tapping "Done" on it follows R3.7.
17. THE default reminder times SHALL be defined in one constants file, and entered times SHALL be validated (valid time, no duplicates, no two at the same minute).
18. WHEN she taps the body of a notification, THE app SHALL open Home.
19. THE app SHALL process each notification response the platform delivers, in order of response time, exactly once.
20. THE reminders SHALL be delivered at their scheduled times, and the Done and Later actions SHALL work, in each of these cases: the app is open; the app is in the background; the app has been swiped away from recent apps; the phone has been restarted. THIS SHALL be verified on a real Samsung phone. (A user-initiated "Force stop" in Android settings cancels all of an app's alarms until she next opens it; no app can prevent this, so it is excluded.)
21. WHEN her name or any reminder setting changes, THE app SHALL reschedule the notifications so the text uses the current name.

## R3 Earning Ace Tickets

**User story:** As her, I want a reward when I finish a task, so it feels good to do them.

1. WHEN a task card is played (Water or Bathroom played from Home or a notification, Stand With Help finished, or an exercise session finished), THE app SHALL award the task-card reward from `economy.ts`: 1 Ace Ticket, 5 Gold Stars and 1 path step.
2. WHEN a task card is played, THE app SHALL play the task-complete celebration: the card flips to an Ace, confetti in red, purple and gold appears, and the ticket and stars fly to their counters.
3. THE app SHALL award the task-card reward at most once per task per day, so a double tap or a repeat reminder does not double-award.
4. THE ticket balance SHALL never be negative.
5. WHEN motion is reduced (R19), THE app SHALL show a static end state with the updated counter instead of motion.
6. WHEN a task completes, THE app SHALL add path progress (R15).
7. WHEN she taps "Done" or "Start" on a notification for a task she has already played today, THE app SHALL show a friendly Ace message and SHALL NOT award tickets, path steps or Royal Flush credit. FOR a Water notification only, each such "Done" SHALL also award 1 Gold Star, up to 3 per day. AFTER 3, Ace SHALL say kindly that she has had plenty of water today and SHALL award nothing. Tapping an already played card on Home gives only an Ace message (R1.16).
8. EVERY reward number, cost and price (tickets, stars, path steps, Royal Flush, prize amounts and weights, game cost, collection prices) SHALL be defined in one file, `src/domain/rewards/economy.ts`, and SHALL be tunable there without other code changes.

## R4 Stand With Help

**User story:** As her, I want a guided way to stand safely with my helper, presented like a game level.

1. THE flow SHALL have 4 steps, one per screen, presented as game levels with a visible progress track showing the current step.
2. **Step 1:** THE screen SHALL show a large "Call for help" button that only opens the dialer with the saved helper number via `tel:` (it never advances the flow), and a big "My helper is here" button, as the primary action, that goes to step 2.
3. IF no helper number is saved, THEN THE screen SHALL show a friendly prompt with a button to Settings.
4. **Step 2:** THE screen SHALL show a checklist "Brakes on", "Feet flat", "Helper beside me". Each item SHALL show a satisfying tick animation when ticked (static tick in reduced motion). THE "Next" button SHALL stay disabled until all three are ticked.
5. **Step 3:** THE screen SHALL first show a big "Start" button. THE countdown SHALL begin only when the helper taps "Start", never when the screen opens. THE countdown SHALL be calm (default 30 seconds, configurable in Settings between 15 and 60 seconds). THE "Sit down" button SHALL be visible at all times on this screen, both before and after "Start".
6. WHEN the countdown ends, THE app SHALL move to step 4. WHEN she taps "Sit down", THE app SHALL end the flow kindly and award the task-card reward (R3.1) if she completed at least the step 2 checklist.
7. **Step 4:** THE screen SHALL show a victory screen with a celebration, award the task-card reward (R3.1) and flip the Stand card to an Ace.
8. THE wording and visuals of every step SHALL always involve the helper and SHALL never suggest standing alone.
9. THE flow SHALL be reachable from Move and from the Stand card on Home in 3 taps or fewer.

## R5 Seated exercises

**User story:** As her, I want simple seated exercises I can follow along, with a feeling of progress.

1. THE exercise list SHALL be generated from `src/data/exercises.ts` (id, name, durationSec, lottie file, instruction text).
2. THE list screen SHALL show each exercise with an icon and short name, and a primary "Start" button.
3. THE session screen SHALL show one exercise at a time: looping Lottie, name, instruction text, a large countdown ring, "Next" and "Stop" buttons.
4. THE session screen SHALL show a progress bar of small cards along the top, one per exercise, and each card SHALL flip to gold when its exercise completes.
5. WHEN an exercise's countdown ends, THE app SHALL advance to the next exercise automatically after a short pause. WHEN she taps "Next", THE app SHALL advance immediately and mark that card as played.
6. WHEN the last exercise finishes, THE app SHALL show a "Session complete" celebration, award the task-card reward (R3.1) and mark the Stretch card as played.
7. WHEN she taps "Stop", THE app SHALL return to the list with a warm Ace message and no penalty. No reward is awarded for an unfinished session.
8. THE app SHALL ship with placeholder Lottie files that can be replaced without code changes.
9. Exercises SHALL be seated; none shall require standing.

## R6 Play tab: reward arcade

**User story:** As her, I want a fun lobby where my tickets get me games.

1. THE Play tab SHALL be styled as a lobby with glossy game tiles.
2. THE Play tab SHALL show a Solitaire tile costing 1 Ace Ticket (defined in `economy.ts`).
3. THE Play tab SHALL show locked tiles for Block Puzzle and Mahjong, labelled "Coming soon", with no star price. These tiles are display-only until those games exist, and nothing is spent.
4. WHEN she taps Solitaire with at least 1 ticket and no saved game, THE app SHALL spend 1 ticket and start a new game.
5. WHEN a saved in-progress game exists, THE app SHALL offer "Continue" at no ticket cost.
6. IF she has 0 tickets and no saved game, THEN THE app SHALL show Ace with a friendly message and a button back to Home.
7. THE ticket SHALL be spent exactly once per new game, and never for resume or Undo.

## R7 Solitaire

**User story:** As her, I want to play Solitaire easily with one hand.

1. THE game SHALL be Klondike, draw 1.
2. THE game SHALL use large cream cards with readable rank and suit, sized for the screen, with the equipped card back and table colour.
3. WHEN she taps a card, THE app SHALL move it automatically to the best valid destination (foundation preferred, then tableau).
4. IF a tapped card has no valid move, THEN THE app SHALL give gentle feedback (soft shake, or a still highlight in reduced motion, and a kind message) with no error tone.
5. THE app SHOULD also allow dragging a card to a valid destination, using react-native-gesture-handler.
6. WHEN she taps the stock, THE app SHALL draw one card, and recycle the waste when the stock is empty.
7. THE app SHALL provide "Undo", "Hint" and "New Game" buttons, each at least 72dp.
8. WHEN she taps "Undo", THE app SHALL restore the exact previous state.
9. WHEN she taps "Hint", THE app SHALL highlight a valid move, or say kindly that no moves remain.
10. WHEN she taps "New Game" with a game in progress, THE app SHALL ask once, calmly, and starting a new game SHALL cost 1 Ace Ticket. The abandoned game is lost.
11. THE app SHALL auto-save after every move and SHALL restore the game on return.
12. WHEN all 52 cards are in the foundations, THE app SHALL award the Solitaire win reward (15 Gold Stars) and show the win celebration and Win screen.
13. WHEN no moves remain, THE app SHALL say so kindly and offer Undo or New Game.
14. THE engine SHALL be pure TypeScript in `src/domain/solitaire` and fully unit-tested, including seeded shuffle, undo and win detection.
15. THE app SHALL deal new games from a list of verified winnable seeds in `src/data/winnableSeeds.ts` (about 300). WHEN a new game starts, THE app SHALL pick a seed from the list that she has not played yet, and once all have been played SHALL start the list again. IF the list is empty or unusable, THEN THE app SHALL fall back to a random seed.
16. THE list SHALL be produced by the script `scripts/generateWinnableSeeds` using a solver in `src/domain/solitaire`. "Verified winnable" means a solver that sees every card found a winning sequence; she can still lose a game that is winnable, for example by playing a different move.
17. A unit test SHALL check that every seed in the list is solvable and that the list matches the current deal algorithm version.
18. WHEN all tableau cards are face-up and the stock and waste are empty, THE app SHALL show a big "Finish for me" button. WHEN she taps it, THE app SHALL move all remaining cards to the foundations automatically, and the game SHALL count as a win (R7.12, R8).
19. THE auto-finish check and move sequence SHALL be pure functions in `src/domain/solitaire` with unit tests.

## R8 Win and Gold Stars

1. WHEN she wins, THE app SHALL award 15 Gold Stars (defined in `economy.ts`).
2. THE app SHALL play the Solitaire win celebration with a "Collect" button, then show the Win screen with stars earned and one primary button (default: "See My Collection" if she can afford an item, otherwise "Back to Play").
3. THE app SHALL track games won.
4. WHEN a win unlocks a medal (for example "First Win"), THE app SHALL show it on the Win screen.

## R9 Rewards / My Collection

**User story:** As her, I want to collect nice things and see how close I am to the next one.

1. THE Rewards tab SHALL show a grid of card backs and table colours with red, purple and gold themes.
2. THE grid SHALL show locked items as silhouettes with their star cost.
3. WHEN she has enough Gold Stars and taps a locked item, THE app SHALL show a calm confirm dialog, then deduct the cost and unlock it.
4. IF she has too few stars, THEN THE app SHALL say kindly how many more are needed.
5. WHEN she taps an unlocked item, THE app SHALL equip it. One card back and one table colour are equipped at a time.
6. THE equipped items SHALL be used in Solitaire.
7. THE star balance SHALL never be negative and an item SHALL not be unlocked twice.
8. A default card back and table colour SHALL be unlocked from the start.
9. THE Rewards tab SHALL show a "Next reward: N more stars" progress bar for the cheapest locked item.
10. THE Rewards tab SHALL show a Medals shelf with earned medals (for example "5 Days of Water", "First Royal Flush") and, for medals not yet earned, a neutral silhouette with no wording about failure.
11. WHEN an item is newly unlocked (by purchase or prize), THE app SHALL show a "New!" ribbon on it until she next views or equips it.
12. THE cheapest collection item SHALL cost 50 Gold Stars. Prices SHALL be defined in `economy.ts`.
13. THE collection SHALL initially hold 9 purchasable items, 3 per theme (red, purple, gold): one card back at 50 stars, one table colour at 100 stars and one card back at 200 stars. A default card back and table colour (R9.8) are extra and not purchasable.

## R10 Settings

1. THE Settings screen SHALL be reachable in 2 taps or fewer and SHALL have no PIN.
2. THE Settings screen SHALL provide: the name Ace calls her; reminder times; sound on/off; helper phone number; text size; stand countdown length; Calm mode / Reduce motion; "How does this work?".
3. WHEN she changes the helper phone number, THE app SHALL validate it and SHALL save it.
4. WHEN she changes text size, THE app SHALL apply it app-wide immediately.
5. THE app SHALL store `settings.displayName` (default "Mom"). WHEN she changes it, THE app SHALL trim it, limit it to 20 characters, fall back to "Mom" if it is empty, and use it in all of Ace's lines and in notification text.
6. THE code SHALL include a documented extension point for a future backup export/import feature. The feature itself is out of scope.
7. THE stand countdown setting SHALL be limited to a minimum of 15 and a maximum of 60 seconds, with a default of 30, all defined in one constants file. Her physio SHOULD confirm this range before release. Stored values outside the range SHALL be clamped.

## R11 Help, Welcome and guide

1. THE app SHALL show a "Help" button on every screen.
2. WHEN she taps it, THE app SHALL open a simple 3-step visual guide titled "Where am I?", with Ace.
3. WHEN the app launches for the first time, THE app SHALL show a Welcome screen with Ace waving, followed by a 3-screen guide, then the permissions explanation, then Home.
4. THE Welcome and guide SHALL be reopenable from Settings ("How does this work?").

## R12 Accessibility and visual design

1. THE app SHALL follow `.kiro/steering/accessibility.md` on every screen.
2. THE theme SHALL define colour, typography, spacing, radii, touch-size and motion tokens in `src/theme`.
3. THE app SHALL use Playfair Display for headings and Nunito for body text, bundled locally.
4. THE app SHALL support text scale options (Normal, Large, Extra large) without breaking layouts.
5. Every touchable SHALL have an accessibility role and label.
6. EVERY reward, state change and celebration SHALL be understandable from its static end state without animation.
7. THE app SHALL use a dark theme (velvet background, cream text, gold accents) on every screen, including Settings, Guide and dialogs. Cards keep cream faces.
8. THE app SHALL have an adaptive icon (burgundy background, gold "A" card foreground) and a splash screen using the Ace art.
9. AT Large and Extra large text sizes, card titles SHALL use the full row width, and chips and reward rows SHALL stack below the title.

## R13 Tooling and quality

1. THE project SHALL be an Expo development build with TypeScript strict mode, ESLint, Prettier and the `@/` alias.
2. Jest tests SHALL cover `src/domain/solitaire`, `rewards`, `reminders`, `tasks` and `progression`.
3. `npm run typecheck`, `npm run lint` and `npm test` SHALL pass before any task is considered done.

## R14 Mascot "Ace"

**User story:** As her, I want a friendly character who guides me, so the app feels warm and I'm never lost.

1. THE app SHALL provide a mascot, Ace: a smiling playing-card character with a tiny crown.
2. THE Mascot component SHALL support the poses waving, cheering, thinking and sleeping, and SHALL show an optional short speech bubble. WHERE artwork exists for only one pose, every pose SHALL show that artwork until the other poses are supplied.
3. THE app SHALL show Ace on Home, in celebrations, in empty states, in the Welcome and guide, and in notification text and icon.
4. THE mascot's speech SHALL come from `src/strings/en.ts` and SHALL be warm and encouraging, never scolding.
5. WHEN motion is reduced, THE Mascot SHALL show a still pose.
6. WHILE it is before her first reminder of the day and no card is due yet, THE Home screen SHALL show Ace sleeping with a gentle message, and SHALL still show the NEXT card with its clock and due time (R1.15). WHEN all 4 cards are played, THE Home screen SHALL show Ace waving with an "all caught up" message. At all other times Ace SHALL be awake and relevant to the NEXT card.
7. THE speech bubble text SHALL be at least 20sp and no more than about 12 words.
8. Ace SHALL address her by `settings.displayName` (default "Mom") in speech and notifications. Mascot lines SHALL take the name as a parameter and SHALL NOT hard-code it.

## R15 Rank ladder and The Path

**User story:** As her, I want to see myself moving forward, so every day feels like progress.

1. THE app SHALL have ranks Jack, Queen, King and Ace, each with several levels (5 levels per rank, 20 path steps per level).
2. THE Home screen SHALL show a rank badge in the rewards strip.
3. WHEN she taps the rank badge, THE app SHALL open The Path screen (a stack screen, not a fifth tab).
4. THE Path screen SHALL show a winding board-game-style path with a node for each rank, a node for each of the 5 levels within every rank, a chest node at every 10 steps, and her token at her current position. Chest nodes SHALL be labelled "Mystery card" and SHALL NOT show any star or ticket amount. THE screen SHALL provide a labelled "Where I am" button that scrolls to her token. A chest node SHALL follow R15.11.
5. WHEN she completes a task or earns a Royal Flush, THE token SHALL move forward; WHEN she reaches a new rank or level, THE app SHALL play the rank-up celebration.
6. THE token SHALL never move backwards, and the Path SHALL show no negative states for missed days.
7. WHEN she reaches a milestone chest, THE app SHALL add a mystery card (R17) to her pending rewards. THE amounts inside are hidden until she reveals it.
8. THE Path screen SHALL show "N days this week" as glowing hearts or candles, lit for each day this week with at least one task completed. Unlit days SHALL be shown as neutral outlines with no wording. THE app SHALL NOT use the word "streak" in the interface (G11).
9. WHEN a new week begins, THE "days this week" display SHALL reset silently, with no message about the previous week.
10. THE rank, level, path and days-this-week logic SHALL be pure, deterministic and unit-tested in `src/domain/progression`.
11. WHILE a mystery card for a chest node or rank node is waiting, THE node SHALL show "Chest ready to open" and, when she taps it, THE app SHALL open the mystery reveal. Otherwise a chest node SHALL look like a normal node labelled "Mystery card", with no padlock, no amounts and no hint of a missing or lost reward.
12. WHEN she reaches a NEW RANK (Queen, King or Ace, not each level), THE app SHALL also add 1 mystery card to her pending rewards, in addition to the chest at that step. THE amount SHALL be defined in `economy.ts`, and each new rank SHALL grant it only once.

## R16 Royal Flush bonus

**User story:** As her, I want a big surprise for finishing my whole hand.

1. WHEN all 4 daily tasks have been completed at least once on the same day, THE app SHALL play a full-screen Royal Flush celebration.
2. THE app SHALL then show a treasure chest that she taps to open. THE chest SHALL show a "?" and SHALL NOT show or hint at its contents before it is opened. Opening it SHALL reveal one mystery prize (R17).
3. THE app SHALL grant the Royal Flush bonus at most once per day, recorded by date.
4. IF the Royal Flush is earned while the app is closed (for example from a notification action), THEN THE app SHALL show the celebration the next time she opens the app.
5. THE Royal Flush eligibility logic SHALL be pure and unit-tested.
6. THE Royal Flush celebration SHALL have a big "Collect" button.
7. WHEN the Royal Flush is earned, THE app SHALL award, from `economy.ts`: 2 Ace Tickets, 20 Gold Stars, 1 mystery card (inside the chest) and 2 path steps. THE tickets and stars SHALL be shown on the celebration; only the mystery card is hidden.

## R17 Mystery reward reveal

**User story:** As her, I want a happy surprise that is always a win.

1. THE app SHALL show a shimmering mystery card that she taps once to reveal a free prize.
2. EACH reveal SHALL give exactly ONE prize, which SHALL be one of: Ace Tickets, Gold Stars, a card back, or a table colour.
3. THE prize SHALL be chosen by a weighted random pure function in `src/domain/rewards`, using a seed and the `PrizeTable` in `src/data/prizes.ts`.
4. WHERE the prize is an item she already owns, THE function SHALL not choose it, and if no prize is available it SHALL fall back to Gold Stars (amount in `economy.ts`).
5. THE app SHALL fix the prize seed when the mystery card is created, so closing and reopening the app never rerolls the prize.
6. THE app SHALL keep an unrevealed mystery card in `pendingMysteryRewards` until she reveals it.
7. WHEN a prize is an item, THE app SHALL unlock it, show a "New!" ribbon and add it to `newlyUnlockedItemIds`.
8. THE reveal SHALL have a "Collect" button.
9. THE prize selection SHALL be unit-tested, including determinism for a given seed and weight distribution over many seeds.

## R18 Celebration system

1. THE app SHALL provide reusable celebration overlays for: task complete, Royal Flush, mystery reveal, Solitaire win and rank-up.
2. EACH celebration SHALL be built from Lottie and Reanimated, and SHALL end in a static state with a big "Collect" button.
3. WHEN more than one celebration is pending, THE app SHALL show them one at a time in this order: task complete, rank-up, Royal Flush, mystery reveal.
4. THE celebrations SHALL be shown through shared components only, not one-off code in screens.
5. THE celebrations SHALL contain no flashing or rapid strobing.
6. THE celebrations SHALL follow the motion level (R19).
7. ON the Royal Flush and task-complete screens, decorations (stars, sparkles, confetti) SHALL never overlap the title or subtitle text, and the card corner indices (rank and suit) SHALL never be clipped.

## R19 Calm mode and reduced motion

1. THE Settings screen SHALL have a "Calm mode / Reduce motion" setting, off by default.
2. WHEN Calm mode is on, THE app SHALL shorten or slow animations, remove looping and fast effects, and reduce confetti, while keeping all rewards, counters and "Collect" buttons.
3. WHEN the Android system "remove animations" setting is on, THE app SHALL treat motion as reduced regardless of the Calm mode setting.
4. THE motion durations, easing and effect counts SHALL be defined as theme tokens so that the motion level scales them in one place.
5. WHEN motion is reduced, THE app SHALL show static end states (still mascot pose, still Ace card, updated counters).

## R20 Free prizes and positive-only feedback

1. THE app SHALL contain no real-money gambling, betting, purchases or ads.
2. EVERY prize SHALL be free, and no action SHALL cost real money.
3. EVERY feedback message SHALL be positive. A reward reveal SHALL always give a prize.
4. THE app SHALL never show counters of missed tasks, lost progress, or failed attempts.

## Out of scope (for now)

iOS builds, backup export/import, additional mini-games (shown locked only), cloud sync, multiple users, PIN protection, languages other than English.

## Decisions (confirmed)

- Reminder times: Water 09:00, 12:00, 17:00; Stretch 10:00; Bathroom 11:00 and 16:00; Stand 15:00 (her helper is present until 17:00). Reminder times are edited per reminder in Settings; the start, end and interval setting is removed.
- One play per task per day. A repeat tap never repeats the card's reward. Tapping a played card on Home gives only an Ace message. "Done" on a Water notification for a played card gives +1 star, up to 3 per day; any other repeat gives an Ace message (R1.16, R3.7).
- Economy (all in `economy.ts`): per task card 1 ticket + 5 stars + 1 path step; Solitaire win 15 stars (also for "Finish for me"); Royal Flush 2 tickets + 20 stars + 2 path steps + 1 mystery card; a mystery reveal gives exactly one prize; the cheapest collection item costs 50 stars.
- Collection: 9 purchasable items at first, 3 per theme (red, purple, gold): a card back at 50 stars, a table colour at 100 stars, a card back at 200 stars. Prices are in `economy.ts`.
- Mystery cards come only from the Royal Flush chest, Path milestone chests (one every 10 path steps) and reaching a new rank (Queen, King or Ace: 1 card each, on top of the chest at that step). The Royal Flush chest shows "?". Path chest nodes are labelled "Mystery card" with no amounts.
- Rank and path numbers: 5 levels per rank, 20 steps per level, a milestone chest every 10 steps.
- Prize weights: 1 ticket (40), 2 tickets (20), 10 stars (20), 25 stars (8), each unowned item (2). The fallback prize is 10 stars.
- A Solitaire win gives 15 stars (the mockup's +25 is wrong). Decorations never overlap the Royal Flush title. There is no large-text Move mockup; R12.9 applies.
- Solitaire new games come from about 300 verified winnable seeds, with a random seed only as a fallback. A "Finish for me" button appears when only moves to the foundations remain.
- Home shows one big featured card (the NEXT card) with a row of 4 small cards beneath it (gold tick when played, clock and due time when pending). Tapping the featured card = "Play card"; tapping another pending small card asks "Play the <name> card now?" with "Yes" and "Not yet". Not-yet-due cards show a clock and due time, never a padlock. Before her first reminder, Ace sleeps but the next card is still shown. Both views come from the same hand state.
- Button labels: "Play card" and "Help" everywhere (the guide screen's title stays "Where am I?"). "Later" stays on Home. "Due now" is gold, never green. Times are shown in 12-hour form with AM/PM.
- Stretch and Stand complete only through their guided flows. Their notifications use "Start" and "Later"; Water and Bathroom use "Done" and "Later". Both actions open Home. Tapping the notification body opens Home.
- Force stop is out of scope for reminders (R2.20). Battery guidance covers Samsung "Sleeping apps", "Deep sleeping apps" and "Put unused apps to sleep".
- Stand With Help step 1 has a big "My helper is here" button (to step 2) as well as "Call for help", which only opens the dialer. The countdown starts when the helper taps "Start". The countdown range is 15 to 60 seconds (default 30), to be confirmed by her physio.
- "N days this week" replaces the word "streak" everywhere, and "streak" is banned from all copy (G11).
- Block Puzzle and Mahjong (games she already plays) are display-only tiles labelled "Coming soon". Card Match, Royal Puzzle and Spiders & Aces from the mockup are ignored.
- Starter medals: First Card Played, 5 Days of Water, First Royal Flush, First Win, Reached Queen/King/Ace.
- Dark theme on every screen (R12.7). Playfair Display and Nunito only. Adaptive icon: burgundy background, gold "A" card.
- Mascot: the supplied Ace art is the base, one pose for now; other poses come later. The notification icon is a single-colour crown-card silhouette (Android restriction).
- `settings.displayName`, default "Mom" (R10.5, R14.8).
- Visual references (Stitch screenshots of Home, Move, Path, task-complete and Royal Flush) live in `.kiro/docs/designs/`. They show layout and style only. Where a mockup's wording or behaviour differs from this spec, the spec wins.
- Application id `com.candice.momspace`. `android:allowBackup="false"`. ts-jest. `react-native-svg`.
- Pinned versions: Expo SDK 56.0.24 with react-native-mmkv 4.3.2 and react-native-nitro-modules 0.35.9 (full list in `.kiro/steering/tech.md`). If MMKV v4 or Nitro causes a problem, stop and report, and propose AsyncStorage behind the same storage adapter instead of working around it.
- Updates: offline builds installed over the existing app. No OTA updates. Every build uses the same application id and signing key so her data is kept.
- Exercises: the owner will supply the real list later. The app ships with placeholder entries.

## Open questions

None.
