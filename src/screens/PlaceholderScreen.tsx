import { Text, View } from 'react-native';

import { ScreenFrame } from '@/components';
import { strings } from '@/strings';
import { useTheme } from '@/theme';

interface PlaceholderScreenProps {
  title: string;
  /** Stack screens show a labelled Back button; tab screens do not. */
  showBack?: boolean;
  showSettings?: boolean;
  showHelp?: boolean;
}

/** Stand-in for a screen that a later task builds. Removed screen by screen. */
export function PlaceholderScreen({
  title,
  showBack = false,
  showSettings = false,
  showHelp = true,
}: PlaceholderScreenProps) {
  const theme = useTheme();
  return (
    <ScreenFrame title={title} showBack={showBack} showSettings={showSettings} showHelp={showHelp}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={theme.text.bodyLarge}>{strings.common.comingSoon}</Text>
      </View>
    </ScreenFrame>
  );
}
