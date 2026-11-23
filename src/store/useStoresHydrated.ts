import { useSyncExternalStore } from 'react';
import { useProgressStore } from './progressStore';
import { useRewardsStore } from './rewardsStore';
import { useSettingsStore } from './settingsStore';
import { useSolitaireStore } from './solitaireStore';

const persisted = [useSettingsStore, useProgressStore, useRewardsStore, useSolitaireStore];

const allHydrated = () => persisted.every((store) => store.persist.hasHydrated());

function subscribe(onChange: () => void) {
  const unsubscribers = persisted.map((store) => store.persist.onFinishHydration(onChange));
  return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
}

/**
 * True once every persisted store has loaded from the device. The app root shows nothing (the
 * splash screen stays up) until then, so no screen ever renders with default data by mistake.
 * MMKV is synchronous, so this is normally true on the first render.
 */
export function useStoresHydrated(): boolean {
  return useSyncExternalStore(subscribe, allHydrated);
}
