import { View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  style?: object;
};

export function Divider({ style }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[{ height: 1, width: '100%', backgroundColor: theme.border }, style]}
    />
  );
}
