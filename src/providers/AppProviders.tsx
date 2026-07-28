import { type ReactNode, useMemo } from 'react';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import { useAuthStore, useThemeStore } from '@/store';
import { colors, darkTheme, lightTheme } from '@/theme';
import { linking } from '@/navigation/linking';
import { I18nProvider } from '@/i18n';

type Props = {
  children: ReactNode;
};

export function AppProviders({ children }: Props) {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const mode = useThemeStore((s) => s.mode);
  const system = useColorScheme();
  const resolved =
    mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
  const theme = resolved === 'dark' ? darkTheme : lightTheme;

  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  const navTheme = useMemo(() => {
    const base = resolved === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.green[500],
        background: theme.background,
        card: theme.card,
        text: theme.text,
        border: theme.border,
        notification: colors.green[500],
      },
    };
  }, [resolved, theme]);

  if (!fontsLoaded || !isHydrated) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.green[500]} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nProvider>
          <NavigationContainer theme={navTheme} linking={linking}>
            {children}
          </NavigationContainer>
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
