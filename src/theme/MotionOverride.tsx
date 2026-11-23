import { createContext, useContext, type ReactNode } from 'react';
import type { MotionLevel } from '@/domain/shared/motionLevel';

const MotionOverrideContext = createContext<MotionLevel | null>(null);

/** Debug gallery only (task 4.6): previews its children at a fixed motion level. */
export function MotionOverride({
  level,
  children,
}: {
  level: MotionLevel | null | undefined;
  children: ReactNode;
}) {
  return (
    <MotionOverrideContext.Provider value={level ?? null}>
      {children}
    </MotionOverrideContext.Provider>
  );
}

export function useMotionOverride(): MotionLevel | null {
  return useContext(MotionOverrideContext);
}
