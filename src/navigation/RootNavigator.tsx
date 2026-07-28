import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { AppShellNavigator } from './AppShellNavigator';
import { useAuthStore } from '@/store';
import { useTheme } from '@/hooks/useTheme';
import { getStackScreenOptions } from './options';
import type { RootStackParamList } from './types';
import { ROUTES } from '@/constants/routes';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const theme = useTheme();

  return (
    <Stack.Navigator screenOptions={getStackScreenOptions(theme)}>
      {isAuthenticated ? (
        <Stack.Screen name={ROUTES.Main} component={AppShellNavigator} />
      ) : (
        <Stack.Screen name={ROUTES.Auth} component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
