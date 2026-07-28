import { Platform, type ViewStyle } from 'react-native';
import { colors } from './colors';

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 32,
  full: 9999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

type Elevation = 'none' | 'sm' | 'md' | 'lg' | 'gold';

const lightShadows: Record<Elevation, ViewStyle> = {
  none: {},
  sm: {
    shadowColor: colors.navy[900],
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: colors.navy[900],
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  lg: {
    shadowColor: colors.navy[900],
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  gold: {
    shadowColor: colors.gold[500],
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
};

const darkShadows: Record<Elevation, ViewStyle> = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  gold: {
    shadowColor: colors.gold[500],
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
};

export function elevation(
  level: Elevation = 'md',
  mode: 'light' | 'dark' = 'light',
): ViewStyle {
  const base = mode === 'dark' ? darkShadows[level] : lightShadows[level];
  if (Platform.OS === 'android' && level === 'none') {
    return { elevation: 0 };
  }
  return base;
}
