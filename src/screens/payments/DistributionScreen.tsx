import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useDistributions, useWallet } from '@/features/wallet/hooks';
import { useTheme } from '@/hooks/useTheme';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/currency';
import { ROUTES } from '@/constants/routes';
import type { DistributionItem } from '@/types';
import type { PaymentsStackParamList } from '@/navigation/types';

export function DistributionScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<PaymentsStackParamList>>();
  const distributions = useDistributions();
  const wallet = useWallet();

  return (
    <Screen scroll>
      <Header showBack title="Distribution list" />
      <Text variant="caption" secondary style={{ marginBottom: 8 }}>
        Payout partners · available {formatCurrency(wallet.available)}
      </Text>
      <Text variant="caption" muted style={{ marginBottom: 18 }}>
        Tap pay to open summary and one-click confirmation.
      </Text>

      {distributions.map((item) => (
        <DistributionCard
          key={item.id}
          item={item}
          onPay={() =>
            navigation.navigate(ROUTES.PaymentSummary, {
              distributionId: item.id,
            })
          }
          onSummary={() =>
            navigation.navigate(ROUTES.PaymentSummary, {
              distributionId: item.id,
            })
          }
        />
      ))}
    </Screen>
  );
}

function DistributionCard({
  item,
  onPay,
  onSummary,
}: {
  item: DistributionItem;
  onPay: () => void;
  onSummary: () => void;
}) {
  const theme = useTheme();
  const tone =
    item.status === 'paid'
      ? 'success'
      : item.status === 'scheduled'
        ? 'gold'
        : 'muted';

  return (
    <View
      style={{
        marginBottom: 12,
        borderRadius: radius['2xl'],
        backgroundColor: theme.card,
        padding: 16,
        borderWidth: theme.mode === 'dark' ? 1 : 0,
        borderColor: theme.border,
        ...elevation('sm', theme.mode),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 10,
        }}
      >
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text variant="bodyMedium">{item.recipient}</Text>
          <Text variant="caption" muted style={{ marginTop: 2 }}>
            {item.role}
          </Text>
        </View>
        <Badge label={item.status} tone={tone} />
      </View>

      <View
        style={{
          height: 6,
          borderRadius: 999,
          backgroundColor: theme.surface,
          overflow: 'hidden',
          marginBottom: 10,
        }}
      >
        <View
          style={{
            width: `${item.percent}%`,
            height: '100%',
            backgroundColor: colors.gold[500],
          }}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <Text
          style={{
            fontFamily: 'DMSans_700Bold',
            fontSize: 16,
            color: colors.gold[600],
          }}
        >
          {formatCurrency(item.amount)}
        </Text>
        <Text variant="caption" muted>
          {item.percent}%
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {item.status !== 'paid' ? (
          <Button title="Pay" size="sm" onPress={onPay} />
        ) : null}
        <Button
          title="Summary"
          size="sm"
          variant="outline"
          onPress={onSummary}
        />
      </View>
    </View>
  );
}
