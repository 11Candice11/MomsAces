/** MMKV keys of every persisted store. Backup (task 2.4) and the stores both read this list. */
export const STORE_KEYS = {
  settings: 'settings-v2',
  progress: 'progress-v2',
  rewards: 'rewards-v2',
  solitaire: 'solitaire-v1',
} as const;

export type StoreName = keyof typeof STORE_KEYS;
