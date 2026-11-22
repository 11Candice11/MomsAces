---
inclusion: always
---

# Accessibility and UX rules (non-negotiable for every screen and component)

## Motor (right hand only, one-handed)
- Primary actions sit in the lower-centre or lower-right of the screen.
- Minimum touch target 72dp (`theme.touch.min`). Spacing between targets at least 16dp.
- No swipe-only gestures. Every drag has a tap alternative (e.g. Solitaire tap-to-move). A scrolling list (such as the Path) also has a labelled button to jump to what matters ("Where I am").
- No long-press, double-tap or multi-finger gestures required.

## Visual
- Body text at least 20sp. Respect the user text-scale setting; layouts must not break at the largest scale.
- High contrast (WCAG AA minimum, aim for AAA on body text).
- Large icons always paired with a short label (2-3 words).
- Palette: burgundy `#7A1F2B`, purple `#4B2A6B`, magenta-red accent `#C2185B`, gold `#D4A94F` (highlight `#F6D98B`), cream `#FFF8E7`, velvet background `#2A1238`. Dark theme on every screen, including Settings, Guide and dialogs (raised panels `#3B1E4F`, cream text). Cards keep cream faces. Green only for "Done" checks, shown on a cream chip so it stays visible on dark backgrounds.
- Never put cream text on gold. Verify every text/background pair in the audit.
- Headings: Playfair Display. Body: Nunito.
- Never convey meaning by colour alone.
- A card that is not yet due shows a clock and its time. No padlock and no greyed-out "locked" look.
- Hidden contents (such as the Royal Flush chest) show a "?" and give no hint in their accessibility labels.
- A Path chest says "Chest ready to open" only when a mystery card is really waiting.

## Large text layouts
- At Large and Extra large text sizes, card titles get the full row width. Chips and reward rows stack below the title, never beside it (see the large-text Move mockup in `docs/design/`). Use the shared `CardRow` and `RewardRow` components.

## Celebration screens (Royal Flush, task complete)
- Decorations (stars, sparkles, confetti) must never overlap the title or subtitle text.
- Card corner indices (rank and suit) must never be clipped, at any text size.
- Check both at the largest text size and in all motion levels.

## Stand With Help
- The countdown starts only when the helper taps "Start", never on screen entry. "Sit down" is visible and enabled at all times.

## Cognitive (short-term memory loss)
- One primary action per screen. The obvious next step is always visible.
- Main action is in the same position on every screen.
- Maximum 3 taps to reach anything.
- Consistent layout. No hidden menus, no overflow menus, no gestures to discover.
- No jargon. Short, warm labels.
- A "Help" button is present on every screen and opens the 3-step visual guide (titled "Where am I?").
- No timeouts that punish. Dialogs never auto-dismiss with important info.
- Confirmations are rare; prefer undo. Destructive actions (New Game, discarding a saved game) get one calm confirmation.

## Motion and celebrations
- All animations must honour Calm mode and the Android system reduce-motion ("remove animations") setting. Read motion values only through `useMotion()` and the motion tokens.
- No flashing and no rapid strobing, in any mode. Glow and shimmer are slow (one cycle per 2.4s or slower) and low-contrast in change.
- Rewards must be readable without animation: every celebration, flip and counter change needs a static end state.
- Calm mode keeps all rewards, counters and "Collect" buttons. It only shortens or slows motion, removes loops and fast effects, and reduces confetti.
- Busy screens overwhelm her: at most one celebration at a time, each with a big "Collect" button in the usual primary position. Nothing auto-dismisses.
- Calm mode is off by default.

## Screen reader
- Every touchable has `accessibilityRole` and `accessibilityLabel` from `strings`.
- Respect reduced-motion settings for celebrations and Lottie loops.

## Review checklist (apply to each UI task)
1. Touch targets >= 72dp?
2. Text >= 20sp and works at max text scale?
3. One primary action, in the usual place?
4. Any scolding or "missed" wording?
5. Reachable in <= 3 taps? "Help" present?
6. Strings come from `src/strings/en.ts`?
7. Does anything imply she should stand alone?
8. Does every animation use `useMotion()`, and is there a static end state?
9. Any flashing or fast effects? Any negative state for a missed day?
10. Checked at the largest text scale and in Calm mode?
11. At Large and Extra large text, do titles have the full row width with chips and rewards stacked below?
12. On celebration screens, do decorations stay clear of the title and subtitle, and are card corner indices unclipped?
13. Does the word "streak" appear anywhere?
