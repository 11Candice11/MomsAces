import type { PersistStorage, StateStorage, StorageValue } from 'zustand/middleware';

export type StorageErrorReporter = (key: string, error: unknown) => void;

/**
 * A JSON PersistStorage that never throws. If a stored value cannot be read or parsed, it reports
 * the problem and returns null, so that store starts from its defaults and the app still opens
 * (design section 21). Zustand never finishes hydration when storage throws, so this matters.
 * The bad value is left in place until the store next saves; nothing is deleted on read.
 */
export function createSafeJSONStorage<S>(
  getStorage: () => StateStorage,
  onError: StorageErrorReporter,
): PersistStorage<S> {
  return {
    getItem: (name) => {
      try {
        const raw = getStorage().getItem(name);
        if (raw === null || typeof raw !== 'string') return null;
        const parsed: unknown = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null || !('state' in parsed)) {
          onError(name, new Error('stored value has no state'));
          return null;
        }
        const { state, version } = parsed as { state: unknown; version?: unknown };
        return {
          state: state as S,
          version: typeof version === 'number' ? version : 0,
        } satisfies StorageValue<S>;
      } catch (error) {
        onError(name, error);
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        getStorage().setItem(name, JSON.stringify(value));
      } catch (error) {
        onError(name, error);
      }
    },
    removeItem: (name) => {
      try {
        getStorage().removeItem(name);
      } catch (error) {
        onError(name, error);
      }
    },
  };
}
