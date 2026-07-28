import { memo } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/format';
import type { PaymentTransaction } from '@/types';

type Props = {
  item: PaymentTransaction;
};

export const RecentPaymentRow = memo(function RecentPaymentRow({ item }: Props) {
  const theme = useTheme();
  const credit = item.type === 'credit';

  return (
    <Card elev="sm" style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
      <View
        style={{
          height: 42,
          width: 42,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: credit
            ? 'rgba(31,157,106,0.12)'
            : 'rgba(214,69,69,0.12)',
          marginRight: 12,
        }}
      >
        <Text
          style={{
            fontFamily: 'DMSans_700Bold',
            fontSize: 16,
            color: credit ? colors.success : colors.error,
          }}
        >
          {credit ? '+' : '−'}
        </Text>
      </View>
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text variant="bodyMedium" numberOfLines={1} style={{ fontSize: 14 }}>
          {item.title}
        </Text>
        <Text variant="caption" muted style={{ marginTop: 2 }}>
          {item.category} · {formatDate(item.date)}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: 'DMSans_700Bold',
          fontSize: 14,
          color: credit ? colors.success : theme.text,
        }}
      >
        {credit ? '+' : '−'}
        {formatCurrency(item.amount)}
      </Text>
    </Card>
  );
});
