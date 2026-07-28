import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { ComponentType } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeStackNavigator } from './stacks/HomeStack';
import { EventsStackNavigator } from './stacks/EventsStack';
import { TicketsStackNavigator } from './stacks/TicketsStack';
import { PaymentsStackNavigator } from './stacks/PaymentsStack';
import { ProfileStackNavigator } from './stacks/ProfileStack';
import { TabBarIcon } from './components/TabBarIcon';
import { TAB_CONFIG } from './tabConfig';
import { getTabBarVisibility } from './tabBarVisibility';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/theme/colors';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const STACK_BY_TAB: Record<keyof MainTabParamList, ComponentType> = {
  Home: HomeStackNavigator,
  Events: EventsStackNavigator,
  Tickets: TicketsStackNavigator,
  Payments: PaymentsStackNavigator,
  Profile: ProfileStackNavigator,
};

export function MainTabNavigator() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'android' ? 14 : 10);

  const defaultTabBarStyle = {
    backgroundColor: theme.tabBar,
    borderTopColor: theme.border,
    borderTopWidth: 1,
    height: 58 + bottomPad,
    paddingBottom: bottomPad,
    paddingTop: 6,
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        lazy: true,
        freezeOnBlur: true,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.green[500],
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: defaultTabBarStyle,
        tabBarLabelStyle: {
          fontFamily: 'DMSans_600SemiBold',
          fontSize: 12,
          marginTop: 2,
        },
      }}
    >
      {TAB_CONFIG.map((tab) => {
        const StackComponent = STACK_BY_TAB[tab.name];
        return (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            component={StackComponent}
            options={({ route }) => {
              const hiddenStyle = getTabBarVisibility(route);
              return {
                title: tab.label,
                tabBarStyle: hiddenStyle ?? defaultTabBarStyle,
                tabBarIcon: ({ color, size, focused }) => (
                  <TabBarIcon
                    name={tab.icon}
                    focusedName={tab.iconFocused}
                    color={color}
                    size={size + 2}
                    focused={focused}
                  />
                ),
              };
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
}

/** @deprecated use MainTabNavigator — drawer replaced by 5 tabs */
export const MainDrawerNavigator = MainTabNavigator;
