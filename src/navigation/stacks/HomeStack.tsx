import { createAppStack } from '../createStack';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { NotificationsScreen } from '@/screens/home/NotificationsScreen';
import type { HomeStackParamList } from '../types';
import { ROUTES } from '@/constants/routes';

const { AppStack } = createAppStack<HomeStackParamList>();

export function HomeStackNavigator() {
  return (
    <AppStack
      initialRouteName={ROUTES.HomeMain}
      screens={[
        { name: ROUTES.HomeMain, component: HomeScreen },
        { name: ROUTES.Notifications, component: NotificationsScreen },
      ]}
    />
  );
}
