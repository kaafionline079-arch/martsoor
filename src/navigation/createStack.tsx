import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import type { ComponentType } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { getStackScreenOptions } from './options';

export type StackScreenConfig<ParamList extends Record<string, object | undefined>> = {
  name: Extract<keyof ParamList, string>;
  component: ComponentType<Record<string, unknown>>;
  options?: NativeStackNavigationOptions;
};

/**
 * Reusable typed stack factory.
 * Applies theme-aware default screen options to every stack.
 */
export function createAppStack<
  ParamList extends Record<string, object | undefined>,
>() {
  const Stack = createNativeStackNavigator<ParamList>();

  function AppStack({
    screens,
    initialRouteName,
  }: {
    screens: StackScreenConfig<ParamList>[];
    initialRouteName?: Extract<keyof ParamList, string>;
  }) {
    const theme = useTheme();
    const defaults = getStackScreenOptions(theme);

    return (
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={defaults}
      >
        {screens.map((screen) => (
          <Stack.Screen
            key={screen.name}
            name={screen.name}
            component={screen.component}
            options={screen.options}
          />
        ))}
      </Stack.Navigator>
    );
  }

  return { Stack, AppStack };
}
