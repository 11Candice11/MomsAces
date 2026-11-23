import type { PersistOptions } from 'zustand/middleware';
import { zustandStorage } from '@/services/storage';
import { STORE_KEYS, type StoreName } from '@/services/storageKeys';
import { createSafeJSONStorage } from './safeJsonStorage';

function reportStorageError(key: string, error: unknown) {
  // Never shown to her. The store falls back to its defaults and the app keeps working.
  if (__DEV__) console.warn(`[storage] could not read "${key}"; using defaults`, error);
}

/**
 * Shared persist settings for every store: its own MMKV key, a version, a JSON storage that never
 * throws, `partialize` so only data (not actions) is saved, and a `merge` that runs every stored
 * value through the store's sanitizer (corrupt data falls back to defaults for that store only).
 * Version 2 is the first shipped shape, so `migrate` hands older data to the sanitizer as-is.
 */
export function persistOptions<TStore extends TData, TData>(config: {
  store: StoreName;
  version: number;
  pick: (state: TStore) => TData;
  sanitize: (raw: unknown) => TData;
}): PersistOptions<TStore, TData> {
  return {
    name: STORE_KEYS[config.store],
    version: config.version,
    storage: createSafeJSONStorage<TData>(() => zustandStorage, reportStorageError),
    partialize: config.pick,
    migrate: (persisted) => persisted as TData,
    merge: (persisted, current) => {
      try {
        return { ...current, ...config.sanitize(persisted) };
      } catch (error) {
        reportStorageError(STORE_KEYS[config.store], error);
        return { ...current, ...config.sanitize(undefined) };
      }
    },
  };
}
