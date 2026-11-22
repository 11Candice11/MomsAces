import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * True when the Android system "remove animations" setting is on.
 * React Native reports this through `isReduceMotionEnabled` and fires `reduceMotionChanged`.
 */
export function useSystemReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}
