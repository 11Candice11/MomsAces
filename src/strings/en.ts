/**
 * Every user-facing string in the app lives here (English only). Components never hard-code text.
 * Rules (see .kiro/steering/product.md):
 *   - Warm and encouraging. Never scold or point out what was not done. Banned words are listed in
 *     .kiro/steering/product.md and checked by `npm run check:copy` (task 15.4).
 *   - Nothing may suggest she should stand without her helper.
 *   - Ace's lines take her name as a parameter (settings.displayName, default "Mom").
 * Groups follow design section 20. Plain strings are addressable by `StringKey`;
 * functions (name, number or time interpolation) and arrays (line pools) are used directly.
 */
type NameLine = (name: string) => string;

export const en = {
  common: {
    appName: "Mom's Aces",
    tagline: 'Every day, a winning hand.',
    defaultDisplayName: 'Mom',
    help: 'Help',
    settings: 'Settings',
    back: 'Back',
    ok: 'OK',
    yes: 'Yes',
    notYet: 'Not yet',
    next: 'Next',
    stop: 'Stop',
    collect: 'Collect',
    start: 'Start',
    later: 'Later',
    playCard: 'Play card',
    tryAgain: "Let's try that again.",
    ticketsLabel: (n: number) => (n === 1 ? '1 Ticket' : `${n} Tickets`),
    starsLabel: (n: number) => (n === 1 ? '1 Star' : `${n} Stars`),
    aceTicketsLabel: (n: number) => (n === 1 ? '1 Ace Ticket' : `${n} Ace Tickets`),
    goldStarsLabel: (n: number) => (n === 1 ? '1 Gold Star' : `${n} Gold Stars`),
    rewardTicketChip: (n: number) => `+${n === 1 ? '1 Ace Ticket' : `${n} Ace Tickets`}`,
    rewardStarsChip: (n: number) => `+${n === 1 ? '1 Star' : `${n} Stars`}`,
  },

  tabs: {
    home: 'Home',
    move: 'Move',
    play: 'Play',
    rewards: 'Rewards',
  },

  ranks: {
    jack: 'Jack',
    queen: 'Queen',
    king: 'King',
    ace: 'Ace',
    rankLevel: (rank: string, level: number) => `${rank} ${level}`,
  },

  tasks: {
    water: { name: 'Drink Water', short: 'Water' },
    bathroom: { name: 'Bathroom Break', short: 'Bathroom' },
    stretch: { name: 'Seated Stretch', short: 'Stretch' },
    stand: { name: 'Stand With Help', short: 'Stand' },
    played: 'Played',
    dueNow: 'Due now',
    dueAt: (time: string) => `Due at ${time}`,
    cardLabel: (task: string, time: string) => `${task} card, due at ${time}`,
    playedCardLabel: (task: string) => `${task} card, played`,
    playThisNow: (task: string) => `Play the ${task} card now?`,
  },

  home: {
    title: 'Home',
    todaysHand: "Today's Hand",
    handProgress: 'Hand Progress',
    cardsPlayed: (played: number, total: number) => `${played} of ${total} cards played`,
    royalFlush: 'Royal Flush',
    allPlayedTitle: 'All played today',
    goToPlay: 'Go to Play',
    mysteryWaiting: 'A mystery card is waiting for you.',
  },

  /** Ace's speech. Each context has a pool of lines; one is picked per day (task 4.2). */
  mascot: {
    nextWater: [
      (name) => `Time for a sip of water, ${name}!`,
      (name) => `A little water would be lovely, ${name}.`,
      (name) => `Water time, ${name}! Cheers!`,
    ] as readonly NameLine[],
    nextBathroom: [
      (name) => `Time for a comfort break, ${name}.`,
      (name) => `Shall we take a little break, ${name}?`,
    ] as readonly NameLine[],
    nextStretch: [
      (name) => `A gentle seated stretch, ${name}?`,
      (name) => `Let's move a little, ${name}. Seated is perfect.`,
    ] as readonly NameLine[],
    nextStand: [
      (name) => `Ready to stand with your helper, ${name}?`,
      (name) => `When your helper is beside you, we can stand together, ${name}.`,
    ] as readonly NameLine[],
    allCaughtUp: [
      (name) => `All done for today, ${name}. You're wonderful!`,
      (name) => `What a day, ${name}! All your cards are played.`,
    ] as readonly NameLine[],
    sleeping: [
      (name) => `Shh... Ace is resting. Good morning soon, ${name}!`,
      (name) => `Ace is having a little nap, ${name}.`,
    ] as readonly NameLine[],
    waiting: [
      (name) => `Whenever you're ready, ${name}.`,
      (name) => `No rush, ${name}. I'm right here.`,
    ] as readonly NameLine[],
    laterConfirmed: [
      (name) => `Of course, ${name}. I'll remind you in 10 minutes.`,
    ] as readonly NameLine[],
    inviteStretch: [(name) => `Tap the card when you're ready, ${name}.`] as readonly NameLine[],
    inviteStand: [
      (name) => `Tap the card when your helper is with you, ${name}.`,
    ] as readonly NameLine[],
    alreadyPlayed: [
      (name) => `That card is already in your hand, ${name}. Lovely!`,
      (name) => `You've got that one covered, ${name}. Well done!`,
    ] as readonly NameLine[],
    extraWater: [
      (name) => `Another sip, ${name}! Here's a bonus star.`,
      (name) => `Lovely, ${name}! A little extra water earns a star.`,
    ] as readonly NameLine[],
    waterEnough: [
      (name) => `That's plenty of water today, ${name}. Well done!`,
    ] as readonly NameLine[],
    noTickets: [
      (name) => `No tickets yet, ${name}. Play a card to earn one!`,
    ] as readonly NameLine[],
    cheer: [
      (name) => `Splendid job, ${name}!`,
      (name) => `You're doing fantastic, ${name}!`,
    ] as readonly NameLine[],
    welcome: [(name) => `Hello, ${name}! I'm Ace. Let's play.`] as readonly NameLine[],
    rankUp: [(name) => `You've moved up, ${name}! Congratulations!`] as readonly NameLine[],
    royalFlush: [(name) => `Incredible, ${name}! You hit the Royal Flush!`] as readonly NameLine[],
    taskComplete: (name: string, task: string) =>
      `Splendid job, ${name}! You completed your ${task} card!`,
  },

  notifications: {
    // Title is Ace's voice; body adds a gentle detail. `firstOfDay` false = a gentler nudge.
    water: {
      title: (name: string) => `Ace says: time for water, ${name}!`,
      nudge: (name: string) => `Ace says: another sip, ${name}?`,
    },
    bathroom: {
      title: (name: string) => `Ace says: time for a break, ${name}.`,
      nudge: (name: string) => `Ace says: a little break, ${name}?`,
    },
    stretch: {
      title: (name: string) => `Ace says: time for a seated stretch, ${name}!`,
      nudge: (name: string) => `Ace says: a gentle stretch, ${name}?`,
    },
    stand: {
      title: (name: string) => `Ace says: stand with your helper, ${name}.`,
      nudge: (name: string) => `Ace says: stand with your helper when you can, ${name}.`,
    },
    actionDone: 'Done',
    actionStart: 'Start',
    actionLater: 'Later',
    channelName: 'Reminders from Ace',
    channelNameSilent: 'Quiet reminders from Ace',
  },

  standWithHelp: {
    title: 'Stand With Help',
    levelOf: (step: number, total: number) => `Level ${step} of ${total}`,
    step1Title: 'Call your helper',
    step1Body: 'Standing is always done together. Your helper needs to be with you.',
    callForHelp: 'Call for help',
    helperIsHere: 'My helper is here',
    noHelperNumber: 'Add your helper’s phone number in Settings, and Ace can call for you.',
    goToSettings: 'Go to Settings',
    step2Title: 'Get ready together',
    brakesOn: 'Brakes on',
    feetFlat: 'Feet flat',
    helperBeside: 'Helper beside me',
    step3Title: 'Stand together',
    step3Ready: 'Helper, tap Start when you are both ready.',
    step3Standing: 'Stand tall with your helper. You’re doing great.',
    sitDown: 'Sit down',
    step4Title: 'Well done!',
    step4Body: 'You did it with help!',
    sitDownKind: 'Lovely work, taking a seat. That was a good effort.',
  },

  exercises: {
    title: 'Seated Exercises',
    easyOnJoints: 'Easy on joints',
    start: 'Start',
    next: 'Next',
    stop: 'Stop',
    sessionComplete: 'Session complete',
    stoppedKindly: 'No problem at all. We can do more any time.',
    placeholderName: (n: number) => `Exercise ${n}`,
    placeholderInstruction: 'The real exercise will be added soon. Just relax and breathe.',
  },

  move: {
    title: 'Move',
    banner: 'Daily move bonus',
    bannerTitle: 'Move & Earn Tickets!',
    gentle: 'Whenever you’re ready. Every gentle move counts!',
    withHelper: 'With a helper',
    safeSteps: (n: number) => `${n} safe steps`,
    minutes: (n: number) => `${n} mins`,
  },

  play: {
    title: 'Play',
    classicSolitaire: 'Classic Solitaire',
    solitaireSubtitle: 'Klondike 1-Card Draw. Calm and relaxing.',
    cost: (n: number) => (n === 1 ? 'Cost: 1 Ticket' : `Cost: ${n} Tickets`),
    continueGame: 'Continue',
    blockPuzzle: 'Block Puzzle',
    mahjong: 'Mahjong',
    comingSoon: 'Coming soon',
    noTicketsTitle: 'No tickets yet',
    backToHome: 'Back to Home',
    pausedAnytime: 'All games can be paused or restarted any time.',
  },

  solitaire: {
    undo: 'Undo',
    hint: 'Hint',
    newGame: 'New Game',
    finishForMe: 'Finish for me',
    newGameConfirm: 'Start a new game? This uses another Ace Ticket.',
    noMoves: 'No more moves. Try Undo, or start a new game.',
    noValidMove: "Let's try another card.",
    youWon: 'You won!',
  },

  rewards: {
    title: 'Rewards',
    myCollection: 'My Collection',
    nextReward: (stars: number) => `Next reward: ${stars} more stars`,
    medals: 'Medals',
    newRibbon: 'New!',
    unlock: 'Unlock',
    equip: 'Use this',
    equipped: 'In use',
    moreStarsNeeded: (n: number) => `${n} more stars to unlock this.`,
    confirmUnlock: (name: string, cost: number) => `Unlock ${name} for ${cost} stars?`,
  },

  path: {
    title: 'The Path',
    whereIAm: 'Where I am',
    token: (name: string) => `${name}'s token`,
    youAreHere: 'You are here',
    mysteryCard: 'Mystery card',
    chestReady: 'Chest ready to open',
    daysThisWeek: (n: number) => (n === 1 ? '1 day this week' : `${n} days this week`),
    toNextChest: (steps: number) =>
      steps === 1 ? '1 step to the next chest' : `${steps} steps to the next chest`,
  },

  celebrations: {
    taskCompleted: 'Task completed',
    magnificent: 'Magnificent!',
    royalFlushTitle: 'Royal Flush!',
    royalFlushSubtitle: 'All 4 daily cards played today!',
    openYourChest: 'Open your chest',
    openChest: 'Open chest',
    mysteryTitle: 'Your mystery card',
    tapToReveal: 'Tap to reveal',
    youWon: 'You won!',
    rankUpTitle: 'You moved up!',
    sessionComplete: 'Session complete',
  },

  settings: {
    title: 'Settings',
    displayName: 'What should Ace call you?',
    reminderTimes: 'Reminder times',
    sound: 'Sound',
    helperPhone: 'Helper phone number',
    textSize: 'Text size',
    textNormal: 'Normal',
    textLarge: 'Large',
    textXLarge: 'Extra large',
    standCountdown: 'Standing time (seconds)',
    calmMode: 'Calm mode',
    calmModeHelp: 'Gentler, slower animations. You still get every reward.',
    howDoesThisWork: 'How does this work?',
    batteryHelp: 'Keep reminders working',
  },

  help: {
    guideTitle: 'Where am I?',
    step1: 'This is your hand for today. Tap Play card to play the next one.',
    step2: 'Playing cards earns Ace Tickets and Gold Stars.',
    step3: 'Use tickets on the Play tab. Collect rewards on the Rewards tab.',
  },

  onboarding: {
    welcomeTitle: "Welcome to Mom's Aces",
    welcomeBody: 'Every day, a winning hand.',
    letsGo: "Let's go",
    permissionsTitle: 'Reminders from Ace',
    permissionsBody: 'Ace can send you a friendly nudge through the day. Is that okay?',
    allow: 'Yes, please',
    notNow: 'Not now',
  },
} as const;

type StringLeaf<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : T[K] extends (...args: never[]) => unknown
      ? never
      : T[K] extends readonly unknown[]
        ? never
        : StringLeaf<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

/** Dot path to a plain string in `en`, for example `home.title`. Used by data files and routes. */
export type StringKey = StringLeaf<typeof en>;

/** Looks up a plain string by its key. */
export function getString(key: StringKey): string {
  let value: unknown = en;
  for (const part of key.split('.')) {
    value = (value as Record<string, unknown>)[part];
  }
  return value as string;
}
