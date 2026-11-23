import { useNavigation } from '@react-navigation/native';
import { Text, View } from 'react-native';
import { BigButton, ScreenFrame } from '@/components';
import { strings } from '@/strings';
import { useTheme } from '@/theme';

/** Placeholder until task 7. Development builds also show the celebration gallery (task 4.6). */
export function SettingsScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  return (
    <ScreenFrame title={strings.settings.title} showBack>
      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.lg }}
      >
        <Text style={theme.text.bodyLarge}>{strings.common.comingSoon}</Text>
        {__DEV__ ? (
          <BigButton
            variant="secondary"
            label={strings.debug.openGallery}
            onPress={() => navigation.navigate('CelebrationGallery')}
          />
        ) : null}
      </View>
    </ScreenFrame>
  );
}
