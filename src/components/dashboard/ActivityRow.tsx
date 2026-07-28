import { memo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/theme/colors';
import { radius } from '@/theme';
import { formatDate } from '@/utils/format';
import type { DashboardActivity } from '@/features/dashboard/selectors';

const iconMap: Record<
  DashboardActivity['icon'],
  keyof typeof Ionicons.glyphMap
> = {
  calendar: 'calendar-outline',
  people: 'people-outline',
  ticket: 'ticket-outline',
  wallet: 'wallet-outline',
  mail: 'mail-outline',
};

const toneColor: Record<DashboardActivity['tone'], string> = {
  gold: colors.gold[600],
  navy: colors.navy[500],
  success: colors.success,
  danger: colors.error,
  muted: colors.navy[400],
};

type Props = {
  item: DashboardActivity;
};

export const ActivityRow = memo(function ActivityRow({ item }: Props) {
  const theme = useTheme();
  const accent = toneColor[item.tone];

  return (
    <Card elev="sm" style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
      <View
        style={{
          height: 42,
          width: 42,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.primaryMuted,
          marginRight: 12,
        }}
      >
        <Ionicons name={iconMap[item.icon]} size={18} color={accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium" numberOfLines={1} style={{ fontSize: 14 }}>
          {item.title}
        </Text>
        <Text variant="caption" muted style={{ marginTop: 2 }} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
      <Text variant="caption" muted style={{ marginLeft: 8 }}>
        {formatDate(item.time)}
      </Text>
    </Card>
  );
});
