import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/theme/colors';

type Props = {
  uri?: string;
  name: string;
  size?: number;
};

export function Avatar({ uri, name, size = 48 }: Props) {
  const theme = useTheme();
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: colors.gold[500],
        }}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.primaryMuted,
        borderWidth: 2,
        borderColor: colors.gold[500],
      }}
    >
      <Text
        style={{
          fontFamily: 'DMSans_700Bold',
          fontSize: size * 0.32,
          color: theme.mode === 'dark' ? colors.gold[300] : colors.navy[900],
        }}
      >
        {initials}
      </Text>
    </View>
  );
}
