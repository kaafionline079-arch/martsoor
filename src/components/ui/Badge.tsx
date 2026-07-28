import { View, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/theme/colors';
import { radius } from '@/theme';

type Tone = 'gold' | 'navy' | 'muted' | 'success' | 'danger';

type Props = {
  label: string;
  tone?: Tone;
};

export function Badge({ label, tone = 'gold' }: Props) {
  const theme = useTheme();

  const palette: Record<Tone, { bg: string; text: string }> = {
    gold: { bg: colors.gold[100], text: colors.gold[700] },
    navy: {
      bg: theme.mode === 'dark' ? colors.navy[700] : colors.navy[50],
      text: theme.mode === 'dark' ? colors.gold[300] : colors.navy[900],
    },
    muted: { bg: theme.surface, text: theme.textSecondary },
    success: { bg: 'rgba(31,157,106,0.12)', text: colors.success },
    danger: { bg: 'rgba(214,69,69,0.12)', text: colors.error },
  };

  const c = palette[tone];

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderRadius: radius.full,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: c.bg,
      }}
    >
      <Text
        style={{
          fontFamily: 'DMSans_600SemiBold',
          fontSize: 11,
          color: c.text,
          letterSpacing: 0.3,
          textTransform: 'capitalize',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
