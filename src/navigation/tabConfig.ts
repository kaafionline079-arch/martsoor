import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { MainTabParamList } from './types';

export type TabConfig = {
  name: keyof MainTabParamList;
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  iconFocused: ComponentProps<typeof Ionicons>['name'];
};

export const TAB_CONFIG: TabConfig[] = [
  {
    name: 'Home',
    label: 'Home',
    icon: 'home-outline',
    iconFocused: 'home',
  },
  {
    name: 'Events',
    label: 'Events',
    icon: 'calendar-outline',
    iconFocused: 'calendar',
  },
  {
    name: 'Tickets',
    label: 'Tickets',
    icon: 'ticket-outline',
    iconFocused: 'ticket',
  },
  {
    name: 'Payments',
    label: 'Payments',
    icon: 'wallet-outline',
    iconFocused: 'wallet',
  },
  {
    name: 'Profile',
    label: 'Profile',
    icon: 'person-outline',
    iconFocused: 'person',
  },
];
