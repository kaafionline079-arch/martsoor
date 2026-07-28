import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import type { AppTheme } from '@/theme';
import { motion } from '@/theme/motion';

export function getStackScreenOptions(
  theme: AppTheme,
): NativeStackNavigationOptions {
  return {
    headerShown: false,
    animation: 'slide_from_right',
    animationDuration: motion.duration.normal,
    gestureEnabled: true,
    fullScreenGestureEnabled: true,
    animationTypeForReplace: 'push',
    contentStyle: {
      backgroundColor: theme.background,
    },
  };
}

export const modalScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'fade_from_bottom',
  animationDuration: motion.duration.normal,
  presentation: 'card',
  gestureEnabled: true,
};

export const successScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'fade',
  animationDuration: motion.duration.fast,
  presentation: 'card',
  gestureEnabled: true,
};
