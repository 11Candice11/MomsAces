---
inclusion: always
---

# Product: Mom's Aces

Tagline: "Every day, a winning hand."

## Purpose
A gamified daily-routine and mobility app for one user. It reminds her to drink water, use the bathroom, do seated exercises and do assisted standing. It rewards her for completing tasks.

## User profile
- 55-year-old woman who uses a wheelchair.
- Left-sided weakness. She uses her RIGHT hand only.
- Short-term memory loss. She may forget what she was doing or where she is in the app.
- Her favourite game is Solitaire.
- She CANNOT stand unassisted. No screen, string or animation may imply she should stand alone.

## Concept: a card game made of real life
The app feels like a polished mobile card game. Her real-life tasks are disguised as game moves, and every action gives an immediate, visible reward.
- **Today's Hand**: the 4 daily tasks (Water, Bathroom, Stretch, Stand). Home shows one big featured card (the next card, glowing) with a row of 4 small cards beneath it: a gold tick when played, a clock and due time when pending. Completing a task flips its card into a golden Ace. The single primary action is "Play card". Each task can be played once per day. A played card is never shown as "Due now".
- **Ace** (mascot): a friendly smiling playing-card character with a tiny crown. Poses: waving, cheering, thinking, sleeping. Gives short, warm speech-bubble guidance ("Time for a sip of water, Mom!"). Ace calls her by `settings.displayName` (default "Mom"). Never hard-code the name in a line. Appears on Home, celebrations, empty states, the guide and notifications. All mascot text lives in `src/strings/en.ts`.
- **Rank ladder**: Jack, Queen, King, Ace, each with 5 levels. **The Path** is a board-game-style path with level nodes, rank cards and a chest every 10 steps; her token only ever moves forward. Reached from the rank badge on Home (not a 5th tab).
- **Royal Flush**: completing all 4 daily tasks gives a full-screen celebration and a treasure chest with a mystery prize. Once per day. The chest shows only a "?" until it is opened.
- **Mystery cards**: a shimmering card she taps once to reveal exactly one free prize (Ace Tickets, Gold Stars, a card back or a table colour). A reveal always gives a prize.
- **Medals**: positive milestones (for example "5 Days of Water", "First Royal Flush").
- "N days this week" is shown as glowing hearts or candles, only ever positive. The word "streak" must not appear anywhere in the interface, including text copied from mockups (use wording like "Daily move bonus" or "N days this week").

## No gambling, no pressure
- No real-money gambling, betting, purchases or ads. All prizes are free.
- Only positive feedback. Never scold, never show negative states for missed days, lost progress or failed attempts.

## Tone rules (non-negotiable)
- Always warm, encouraging and plain.
- Never scold. Never show guilt, pressure or "you missed X" language.
- Missed tasks quietly roll over. Do not display overdue counts, red warnings or lost-progress messages.
- A new week resets "days this week" silently. Nothing is ever announced as lost.
- A card that is not yet due shows a clock and its due time. Never show a padlock or a locked state for it.
- Tapping "Done" or a card always gets a friendly answer from Ace, never silence and never a scolding ("already done"). Repeat Water taps give a small star bonus, up to 3 per day.
- Short sentences. No jargon. No technical error text; use friendly wording ("Let's try that again").
- Every user-facing string lives in `src/strings/en.ts`. Never hard-code text in components.

## Terminology (use exactly)
- **Ace Tickets**: earned by completing tasks. One ticket = one game of Solitaire.
- **Gold Stars**: earned by winning Solitaire. Spent to unlock items.
- **My Collection**: cosmetic items (card backs, table colours) unlocked with Gold Stars.
- **Today's Hand**: the 4 daily task cards on Home. **Next card**: the one that is due now.
- **Ace**: the mascot. **Royal Flush**: all 4 cards played in a day. **The Path**: the rank progress board. **Mystery card**: a free surprise prize.
- **Helper**: the person who assists her (phone number saved in Settings).

## Reward loop
Stretch and Stand are played only through their guided flows (Exercise Session, Stand With Help). Their notifications say "Start"; Water and Bathroom notifications say "Done".
Task card played -> card flips to Ace + 1 Ace Ticket + 5 Gold Stars + 1 path step -> play one Solitaire game -> win -> 15 Gold Stars -> unlock items in My Collection (cheapest 50 stars).
All 4 tasks in a day -> Royal Flush: 2 tickets + 20 stars + 2 path steps + a chest with one mystery prize. Path milestones (every 10 steps) -> chest -> mystery card.
Every reward number lives in `src/domain/rewards/economy.ts`.

## Scope
- Android only for now. Local-only. English only.
- New Solitaire games come from a list of verified winnable deals. When only moves to the foundations remain, a "Finish for me" button completes the game and counts as a win.
- Visual references (Stitch mockups of Home, Move, Path, task-complete and Royal Flush) are in `.kiro/docs/designs/`. They show layout and style only; the spec wins on wording and behaviour.
- One user. No accounts, no PIN.
