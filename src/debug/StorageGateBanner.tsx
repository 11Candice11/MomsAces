/**
 * TEMPORARY (task 1.9 gate). Debug builds only. Remove in task 2.1.
 *
 * Proves MMKV v4 + Nitro work on the device: each app launch increments a counter and
 * stores the launch time, so after a force-stop the banner shows the next number and the
 * earlier timestamp.
 */
import { createMMKV } from 'react-native-mmkv';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/theme';

const COUNT_KEY = 'gate.launchCount';
const LAST_KEY = 'gate.lastLaunchAt';

type LaunchInfo = { count: number; previous: number | undefined };

// Computed once per JS start, so re-renders and fast refresh do not count as launches.
let launchInfo: LaunchInfo | undefined;

function recordLaunch(): LaunchInfo {
  if (launchInfo) return launchInfo;
  const storage = createMMKV({ id: 'storage-gate' });
  const count = (storage.getNumber(COUNT_KEY) ?? 0) + 1;
  const previous = storage.getNumber(LAST_KEY);
  storage.set(COUNT_KEY, count);
  storage.set(LAST_KEY, Date.now());
  launchInfo = { count, previous };
  return launchInfo;
}

export function StorageGateBanner() {
  if (!__DEV__) return null;

  let message: string;
  try {
    const { count, previous } = recordLaunch();
    const previousText = previous === undefined ? 'none' : new Date(previous).toLocaleString();
    message = `MMKV OK. Launch ${count}. Previous: ${previousText}`;
  } catch (error) {
    message = `MMKV FAILED: ${error instanceof Error ? error.message : String(error)}`;
  }

  return (
    <View style={styles.banner} accessibilityRole="text">
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.gold,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  text: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: 18,
  },
});
