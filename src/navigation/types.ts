import type { NavigatorScreenParams } from '@react-navigation/native';

/** The four bottom tabs. */
export type TabParamList = {
  Home: undefined;
  Move: undefined;
  Play: undefined;
  Rewards: undefined;
};

/** Everything above the tabs: flows and extra screens. Onboarding routes are added in task 14. */
export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  Path: undefined;
  StandWithHelp: undefined;
  ExerciseSession: undefined;
  Solitaire: undefined;
  Win: undefined;
  Settings: undefined;
  BatteryGuide: undefined;
  /** The 3-step guide titled "Where am I?", opened by the Help button. Shown as a modal. */
  Guide: undefined;
  /** Development builds only: previews every celebration (task 4.6). */
  CelebrationGallery: undefined;
};

declare global {
  namespace ReactNavigation {
    // Makes useNavigation, Link and friends know our routes without extra generics.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
