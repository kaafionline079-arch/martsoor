import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { darkTheme, lightTheme, type AppTheme } from '@/theme';

export function useTheme(): AppTheme {
  const mode = useThemeStore((s) => s.mode);
  const system = useColorScheme();

  const resolved: 'light' | 'dark' =
    mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;

  return resolved === 'dark' ? darkTheme : lightTheme;
}

export function useIsDark(): boolean {
  return useTheme().mode === 'dark';
}
