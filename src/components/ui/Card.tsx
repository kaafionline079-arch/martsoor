import { View, type ViewProps, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { elevation, radius } from '@/theme';

type Props = ViewProps & {
  padded?: boolean;
  elev?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle | ViewStyle[];
};

export function Card({
  padded = true,
  elev = 'md',
  style,
  children,
  ...rest
}: Props) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.card,
          borderRadius: radius['2xl'],
          padding: padded ? 16 : 0,
          borderWidth: theme.mode === 'dark' ? 1 : 0,
          borderColor: theme.border,
          overflow: 'hidden',
          ...elevation(elev, theme.mode),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
