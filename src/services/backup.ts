/**
 * FUTURE EXTENSION POINT (R10.6, task 2.4). Backup export and import are out of scope for now and
 * are not wired to the UI. A later version can implement these with the list of persisted keys
 * below: read each key from storage into one JSON document, and write them back on import (then
 * reload the stores). Keep the app local-only: a backup would be a file she shares herself.
 */
import { STORE_KEYS } from './storageKeys';

/** Every persisted store key. A backup must include all of them. */
export const BACKUP_STORE_KEYS: readonly string[] = Object.values(STORE_KEYS);

export function exportBackup(): string {
  throw new Error('exportBackup: not implemented (future extension point)');
}

export function importBackup(_json: string): void {
  throw new Error('importBackup: not implemented (future extension point)');
}
