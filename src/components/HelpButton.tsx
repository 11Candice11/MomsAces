import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/navigation/types';
import { strings } from '@/strings';

import { IconButton } from './IconButton';

/** "Help" is on every screen and opens the 3-step guide, titled "Where am I?". */
export function HelpButton() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <IconButton
      icon="help-circle-outline"
      label={strings.common.help}
      onPress={() => navigation.navigate('Guide')}
    />
  );
}
