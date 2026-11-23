/**
 * The only place that talks to MMKV (design section 5). Stores only ever see `zustandStorage`,
 * so swapping MMKV for AsyncStorage later would change nothing outside this file.
 * MMKV v4 API: `createMMKV()` and `remove()` (v3 used `new MMKV()` and `delete()`).
 */
import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

const mmkv = createMMKV({ id: 'moms-aces' });

export const zustandStorage: StateStorage = {
  getItem: (key) => mmkv.getString(key) ?? null,
  setItem: (key, value) => mmkv.set(key, value),
  removeItem: (key) => {
    mmkv.remove(key);
  },
};
