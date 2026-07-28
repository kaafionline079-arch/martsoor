import { colors } from './colors';

export type AppTheme = {
  mode: 'light' | 'dark';
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderStrong: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  overlay: string;
  primary: string;
  primaryMuted: string;
  secondary: string;
  danger: string;
  success: string;
  card: string;
  tabBar: string;
  input: string;
  inputBorder: string;
};

export const lightTheme: AppTheme = {
  mode: 'light',
  background: colors.light.background,
  surface: colors.light.surface,
  surfaceElevated: colors.light.surfaceElevated,
  border: colors.light.border,
  borderStrong: colors.light.borderStrong,
  text: colors.light.text,
  textSecondary: colors.light.textSecondary,
  textMuted: colors.light.textMuted,
  overlay: colors.light.overlay,
  primary: colors.green[500],
  primaryMuted: colors.green[50],
  secondary: colors.navy[900],
  danger: colors.error,
  success: colors.success,
  card: colors.white,
  tabBar: colors.white,
  input: colors.white,
  inputBorder: colors.light.border,
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  background: colors.dark.background,
  surface: colors.dark.surface,
  surfaceElevated: colors.dark.surfaceElevated,
  border: colors.dark.border,
  borderStrong: colors.dark.borderStrong,
  text: colors.dark.text,
  textSecondary: colors.dark.textSecondary,
  textMuted: colors.dark.textMuted,
  overlay: colors.dark.overlay,
  primary: colors.green[500],
  primaryMuted: colors.green[900],
  secondary: colors.navy[700],
  danger: colors.error,
  success: colors.success,
  card: colors.dark.surfaceElevated,
  tabBar: colors.dark.surface,
  input: colors.dark.surfaceElevated,
  inputBorder: colors.dark.border,
};
