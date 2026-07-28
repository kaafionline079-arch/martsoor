import { memo } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/theme/colors';
import { radius } from '@/theme';

type Props = {
  rate: number;
  checkedIn: number;
  confirmed: number;
};

export const AttendanceCard = memo(function AttendanceCard({
  rate,
  checkedIn,
  confirmed,
}: Props) {
  const theme = useTheme();
  const widthPct = Math.max(6, Math.min(100, rate));

  return (
    <Card elev="md" style={{ marginBottom: 8 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <Text variant="h3">Attendance</Text>
        <Text
          style={{
            fontFamily: 'DMSans_700Bold',
            fontSize: 20,
            color: colors.gold[600],
          }}
        >
          {rate}%
        </Text>
      </View>

      <View
        style={{
          height: 10,
          borderRadius: radius.full,
          backgroundColor: theme.surface,
          overflow: 'hidden',
          marginBottom: 14,
        }}
      >
        <View
          style={{
            width: `${widthPct}%`,
            height: '100%',
            backgroundColor: colors.gold[500],
            borderRadius: radius.full,
          }}
        />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="caption" muted>
          {checkedIn} checked in
        </Text>
        <Text variant="caption" muted>
          {confirmed} confirmed
        </Text>
      </View>
    </Card>
  );
});
