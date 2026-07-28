import { memo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/theme/colors';
import { radius } from '@/theme';

type Props = {
  label: string;
  value: string;
  hint?: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent?: string;
};

export const MetricCard = memo(function MetricCard({
  label,
  value,
  hint,
  icon,
  accent = colors.gold[500],
}: Props) {
  const theme = useTheme();

  return (
    <Card
      elev="sm"
      style={{
        width: '48%',
        marginBottom: 12,
        minHeight: 112,
      }}
    >
      <View
        style={{
          height: 36,
          width: 36,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.primaryMuted,
          marginBottom: 12,
        }}
      >
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <Text
        style={{
          fontFamily: 'DMSans_700Bold',
          fontSize: 22,
          color: theme.text,
          marginBottom: 2,
        }}
      >
        {value}
      </Text>
      <Text variant="caption" muted>
        {label}
      </Text>
      {hint ? (
        <Text
          style={{
            marginTop: 6,
            fontFamily: 'DMSans_500Medium',
            fontSize: 11,
            color: accent,
          }}
        >
          {hint}
        </Text>
      ) : null}
    </Card>
  );
});
