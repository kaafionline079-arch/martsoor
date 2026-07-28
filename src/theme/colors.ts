export const colors = {
  green: {
    50: '#ECF8EE',
    100: '#D4EFDA',
    200: '#A9DFB5',
    300: '#7ECF90',
    400: '#5CBC6A',
    500: '#45AC4D',
    600: '#388B3E',
    700: '#2B6A30',
    800: '#1E4A22',
    900: '#122A14',
  },
  /** @deprecated alias — use colors.green */
  gold: {
    50: '#ECF8EE',
    100: '#D4EFDA',
    200: '#A9DFB5',
    300: '#7ECF90',
    400: '#5CBC6A',
    500: '#45AC4D',
    600: '#388B3E',
    700: '#2B6A30',
    800: '#1E4A22',
    900: '#122A14',
  },
  navy: {
    50: '#F3F4F6',
    100: '#E5E7EB',
    200: '#D1D5DB',
    300: '#9CA3AF',
    400: '#6B7280',
    500: '#4B5563',
    600: '#374151',
    700: '#1F2937',
    800: '#111827',
    900: '#0A0A0A',
  },
  light: {
    background: '#FFFFFF',
    surface: '#F7F8F7',
    surfaceElevated: '#FFFFFF',
    border: '#E5E7EB',
    borderStrong: '#D1D5DB',
    text: '#0A0A0A',
    textSecondary: '#374151',
    textMuted: '#6B7280',
    overlay: 'rgba(10, 10, 10, 0.45)',
  },
  dark: {
    background: '#0A0A0A',
    surface: '#111827',
    surfaceElevated: '#1F2937',
    border: '#374151',
    borderStrong: '#4B5563',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#B8C2CE',
    overlay: 'rgba(0, 0, 0, 0.55)',
  },
  success: '#45AC4D',
  warning: '#D4A017',
  error: '#D64545',
  info: '#3B6FD9',
  white: '#FFFFFF',
  black: '#000000',
} as const;

/** @deprecated use colors.green */
export const primary = colors.green;
/** @deprecated use colors.navy */
export const secondary = colors.navy;

export type ColorToken = typeof colors;
export type ThemeMode = 'light' | 'dark' | 'system';
