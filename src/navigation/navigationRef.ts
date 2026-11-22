import { createNavigationContainerRef } from '@react-navigation/native';

import type { RootStackParamList } from './types';

/** Lets non-UI code (for example the notification handler in task 6) navigate to Home. */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
