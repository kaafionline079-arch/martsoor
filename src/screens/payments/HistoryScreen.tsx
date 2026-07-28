import { useMemo, useState, memo, useCallback } from 'react';
import { FlatList, ScrollView, View, type ListRenderItem } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { AnimatedPressable } from '@/components/shared/AnimatedPressable';
import { usePaymentTransactions } from '@/features/wallet/hooks';
import { useTheme } from '@/hooks/useTheme';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/format';
import { ROUTES } from '@/constants/routes';
import type { PaymentTransaction } from '@/types';
import type { PaymentsStackParamList } from '@/navigation/types';

type Filter = 'all' | 'credit' | 'debit' | 'failed';

export function HistoryScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<PaymentsStackParamList>>();
  const transactions = usePaymentTransactions();
  const [filter, setFilter] = useState<Filter>('all');

  const data = useMemo(() => {
    return transactions.filter((txn) => {
      if (filter === 'all') return true;
      if (filter === 'failed') return txn.status === 'failed';
      return txn.type === filter;
    });
  }, [filter, transactions]);

  const renderItem: ListRenderItem<PaymentTransaction> = useCallback(
    ({ item }) => (
      <TransactionRow
        txn={item}
        onPress={() => navigation.navigate(ROUTES.PaymentSummary, {})}
      />
    ),
    [navigation],
  );

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: 20 }}>
        <Header showBack title="Payment history" />
        <Text variant="caption" secondary style={{ marginBottom: 12 }}>
          {data.length} fake ledger entries · local only
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, marginBottom: 14 }}
        >
          {(
            [
              ['all', 'All'],
              ['credit', 'Credits'],
              ['debit', 'Debits'],
              ['failed', 'Failed'],
            ] as const
          ).map(([value, label]) => (
            <FilterChip
              key={value}
              label={label}
              active={filter === value}
              onPress={() => setFilter(value)}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 32,
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="No transactions"
            description="Nothing matches this filter in the local ledger."
            compact
          />
        }
        renderItem={renderItem}
        initialNumToRender={10}
        maxToRenderPerBatch={12}
        windowSize={7}
        removeClippedSubviews
      />
    </Screen>
  );
}

const FilterChip = memo(function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <AnimatedPressable
      haptic
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: radius.full,
        backgroundColor: active ? colors.gold[500] : theme.card,
        borderWidth: 1,
        borderColor: active ? colors.gold[500] : theme.border,
      }}
    >
      <Text
        style={{
          fontFamily: 'DMSans_600SemiBold',
          fontSize: 12,
          color: active ? colors.navy[900] : theme.textSecondary,
        }}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
});

const TransactionRow = memo(function TransactionRow({
  txn,
  onPress,
}: {
  txn: PaymentTransaction;
  onPress: () => void;
}) {
  const theme = useTheme();
  const isCredit = txn.type === 'credit';

  return (
    <AnimatedPressable
      haptic
      onPress={onPress}
      style={{
        marginBottom: 10,
        borderRadius: radius['2xl'],
        backgroundColor: theme.card,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: theme.mode === 'dark' ? 1 : 0,
        borderColor: theme.border,
        ...elevation('sm', theme.mode),
      }}
    >
      <View
        style={{
          height: 42,
          width: 42,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            txn.status === 'failed'
              ? 'rgba(214,69,69,0.12)'
              : isCredit
                ? 'rgba(31,157,106,0.12)'
                : 'rgba(214,69,69,0.12)',
          marginRight: 12,
        }}
      >
        <Text
          style={{
            fontFamily: 'DMSans_700Bold',
            fontSize: 16,
            color:
              txn.status === 'failed'
                ? colors.error
                : isCredit
                  ? colors.success
                  : colors.error,
          }}
        >
          {isCredit ? '+' : '−'}
        </Text>
      </View>

      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text variant="bodyMedium" numberOfLines={1}>
          {txn.title}
        </Text>
        <Text variant="caption" muted style={{ marginTop: 2 }}>
          {txn.category} · {formatDate(txn.date)}
          {txn.reference ? ` · ${txn.reference}` : ''}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <Text
          style={{
            fontFamily: 'DMSans_700Bold',
            fontSize: 14,
            color: isCredit ? colors.success : theme.text,
          }}
        >
          {isCredit ? '+' : '−'}
          {formatCurrency(txn.amount)}
        </Text>
        <Badge
          label={txn.status}
          tone={
            txn.status === 'completed'
              ? 'success'
              : txn.status === 'pending'
                ? 'gold'
                : 'danger'
          }
        />
      </View>
    </AnimatedPressable>
  );
});

