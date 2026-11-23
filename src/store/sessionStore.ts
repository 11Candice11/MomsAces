import { create } from 'zustand';
import type { TaskId } from '@/domain/tasks/definitions';

interface SessionStore {
  /**
   * The card she came for from a notification "Done" or "Start" (design section 6). Not
   * persisted: it is NEXT on Home until she plays it, snoozes it, or plays another card.
   */
  homeFocus: TaskId | null;
  setHomeFocus: (focus: TaskId | null) => void;
}

export const useSessionStore = create<SessionStore>()((set) => ({
  homeFocus: null,
  setHomeFocus: (homeFocus) => set({ homeFocus }),
}));
