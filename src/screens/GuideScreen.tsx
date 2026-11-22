import { strings } from '@/strings';

import { PlaceholderScreen } from './PlaceholderScreen';

export function GuideScreen() {
  return <PlaceholderScreen title={strings.help.guideTitle} showBack showHelp={false} />;
}
