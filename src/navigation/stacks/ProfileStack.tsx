import { createAppStack } from '../createStack';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { EditProfileScreen } from '@/screens/profile/EditProfileScreen';
import { SettingsScreen } from '@/screens/profile/SettingsScreen';
import type { ProfileStackParamList } from '../types';
import { ROUTES } from '@/constants/routes';

const { AppStack } = createAppStack<ProfileStackParamList>();

export function ProfileStackNavigator() {
  return (
    <AppStack
      initialRouteName={ROUTES.ProfileMain}
      screens={[
        { name: ROUTES.ProfileMain, component: ProfileScreen },
        { name: ROUTES.EditProfile, component: EditProfileScreen },
        { name: ROUTES.Settings, component: SettingsScreen },
      ]}
    />
  );
}
