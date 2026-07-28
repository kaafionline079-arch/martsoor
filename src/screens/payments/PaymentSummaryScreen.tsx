import { View } from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { usePaymentSummary } from '@/features/wallet/hooks';
import { useTheme } from '@/hooks/useTheme';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/format';
import { ROUTES } from '@/constants/routes';
import type { PaymentsStackParamList } from '@/navigation/types';

export function PaymentSummaryScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<PaymentsStackParamList>>();
  const route = useRoute<RouteProp<PaymentsStackParamList, 'PaymentSummary'>>();
  const theme = useTheme();
  const distributionId = route.params?.distributionId;
  const summary = usePaymentSummary(distributionId);
  const selected = summary.selected;

  return (
    <Screen scroll>
      <Header showBack title="Payment summary" />
      <Text variant="caption" secondary style={{ marginBottom: 18 }}>
        Fake totals from local wallet state — no API.
      </Text>

      <View
        style={{
          borderRadius: radius['3xl'],
          backgroundColor: colors.navy[900],
          padding: 20,
          marginBottom: 18,
          ...elevation('md', theme.mode),
        }}
      >
        <Text
          style={{
            fontFamily: 'Fraunces_600SemiBold',
            fontSize: 12,
            color: colors.gold[300],
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          {selected ? 'Payout amount' : 'Wallet net'}
        </Text>
        <Text
          style={{
            fontFamily: 'Fraunces_600SemiBold',
            fontSize: 32,
            color: colors.white,
            marginBottom: 8,
          }}
        >
          {formatCurrency(selected ? selected.amount : summary.net)}
        </Text>
        <Text
          style={{
            fontFamily: 'DMSans_400Regular',
            fontSize: 13,
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          {selected
            ? `${selected.recipient} · ${selected.role}`
            : `Credits ${formatCurrency(summary.credits)} − Debits ${formatCurrency(summary.debits)}`}
        </Text>
      </View>

      {selected ? (
        <View
          style={{
            borderRadius: radius['2xl'],
            backgroundColor: theme.card,
            padding: 16,
            marginBottom: 16,
            borderWidth: theme.mode === 'dark' ? 1 : 0,
            borderColor: theme.border,
            ...elevation('sm', theme.mode),
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <Text variant="bodyMedium">Distribution</Text>
            <Badge
              label={selected.status}
              tone={
                selected.status === 'paid'
                  ? 'success'
                  : selected.status === 'scheduled'
                    ? 'gold'
                    : 'muted'
              }
            />
          </View>
          <Row label="Recipient" value={selected.recipient} />
          <Row label="Role" value={selected.role} />
          <Row label="Share" value={`${selected.percent}%`} />
          <Row label="Amount" value={formatCurrency(selected.amount)} />
          <Row
            label="Available"
            value={formatCurrency(summary.wallet.available)}
            last
          />
        </View>
      ) : (
        <View
          style={{
            borderRadius: radius['2xl'],
            backgroundColor: theme.card,
            padding: 16,
            marginBottom: 16,
            borderWidth: theme.mode === 'dark' ? 1 : 0,
            borderColor: theme.border,
            ...elevation('sm', theme.mode),
          }}
        >
          <Row label="Balance" value={formatCurrency(summary.wallet.balance)} />
          <Row
            label="Available"
            value={formatCurrency(summary.wallet.available)}
          />
          <Row
            label="Pending payouts"
            value={formatCurrency(summary.pendingTotal)}
          />
          <Row
            label="Paid out"
            value={formatCurrency(summary.paidTotal)}
            last
          />
        </View>
      )}

      <Text variant="bodyMedium" style={{ marginBottom: 10 }}>
        Recent ledger
      </Text>
      {summary.recent.map((txn) => (
        <View
          key={txn.id}
          style={{
            marginBottom: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
          }}
        >
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text variant="caption" numberOfLines={1}>
              {txn.title}
            </Text>
            <Text variant="caption" muted>
              {formatDate(txn.date)}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: 'DMSans_600SemiBold',
              fontSize: 13,
              color:
                txn.type === 'credit' ? colors.success : theme.text,
            }}
          >
            {txn.type === 'credit' ? '+' : '−'}
            {formatCurrency(txn.amount)}
          </Text>
        </View>
      ))}

      <View style={{ marginTop: 20, gap: 12 }}>
        {selected && selected.status !== 'paid' ? (
          <Button
            title="Continue to confirm"
            fullWidth
            size="lg"
            onPress={() =>
              navigation.navigate(ROUTES.PaymentConfirm, {
                distributionId: selected.id,
              })
            }
          />
        ) : null}
        <Button
          title="Payment history"
          fullWidth
          variant="outline"
          onPress={() => navigation.navigate(ROUTES.History)}
        />
      </View>
    </Screen>
  );
}

function Row({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.border,
      }}
    >
      <Text variant="caption" muted>
        {label}
      </Text>
      <Text variant="bodyMedium">{value}</Text>
    </View>
  );
}
