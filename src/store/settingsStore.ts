import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistOptions } from './persistOptions';
import { defaultSettings, sanitizeSettings, type SettingsData } from './sanitize';

export interface SettingsStore extends SettingsData {
  /** Changes some settings. The result is validated, so an invalid value can never be saved. */
  update: (patch: Partial<SettingsData>) => void;
}

const pickSettings = (s: SettingsStore): SettingsData => ({
  reminderTimes: s.reminderTimes,
  soundOn: s.soundOn,
  helperPhone: s.helperPhone,
  displayName: s.displayName,
  textScale: s.textScale,
  standCountdownSec: s.standCountdownSec,
  calmMode: s.calmMode,
  onboardingDone: s.onboardingDone,
  permissionsExplained: s.permissionsExplained,
});

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...defaultSettings(),
      update: (patch) => set(sanitizeSettings({ ...pickSettings(get()), ...patch })),
    }),
    persistOptions<SettingsStore, SettingsData>({
      store: 'settings',
      version: 2,
      pick: pickSettings,
      sanitize: sanitizeSettings,
    }),
  ),
);
