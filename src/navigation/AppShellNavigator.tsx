import { createDrawerNavigator } from '@react-navigation/drawer';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { MainTabNavigator } from './MainTabNavigator';
import { AppDrawerContent } from './AppDrawerContent';
import { colors } from '@/theme/colors';
import type { MainTabParamList } from './types';

export type AppDrawerParamList = {
  Tabs: NavigatorScreenParams<MainTabParamList>;
};

const Drawer = createDrawerNavigator<AppDrawerParamList>();

/** Sidebar + 5 bottom tabs */
export function AppShellNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.4)',
        drawerStyle: {
          width: '82%',
          maxWidth: 340,
          backgroundColor: colors.white,
        },
      }}
    >
      <Drawer.Screen name="Tabs" component={MainTabNavigator} />
    </Drawer.Navigator>
  );
}
