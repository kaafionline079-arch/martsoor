import { useState } from 'react';
import { Alert, View } from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ResultState } from '@/components/shared/ResultState';
import { useDistribution, useWallet } from '@/features/wallet/hooks';
import { useWalletStore } from '@/store/walletStore';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/useTheme';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/currency';
import { toErrorMessage } from '@/utils/errors';
import { logger } from '@/utils/logger';
import { ROUTES } from '@/constants/routes';
import type { PaymentsStackParamList } from '@/navigation/types';

export function PaymentConfirmScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<PaymentsStackParamList>>();
  const route = useRoute<RouteProp<PaymentsStackParamList, 'PaymentConfirm'>>();
  const theme = useTheme();
  const { t } = useI18n();
  const item = useDistribution(route.params.distributionId);
  const wallet = useWallet();
  const confirmPayment = useWalletStore((s) => s.confirmPayment);
  const [loading, setLoading] = useState(false);

  if (!item) {
    return (
      <ResultState
        title="Confirm"
        message="Distribution-kan lama helin. Dib u soo celi list-ka."
        actionLabel="Back to list"
        onAction={() => navigation.navigate(ROUTES.Distribution)}
      />
    );
  }

  const canAfford = item.amount <= wallet.available;

  const run = async (forceFail = false) => {
    try {
      setLoading(true);
      const attempt = await confirmPayment(item.id, { forceFail });
      if (!attempt) {
        Alert.alert('Payment', 'Lacag-bixinta lama bilaabi karin.');
        return;
      }
      if (attempt.status === 'success') {
        navigation.replace(ROUTES.PaymentSuccess, { paymentId: attempt.id });
      } else {
        navigation.replace(ROUTES.PaymentFailed, { paymentId: attempt.id });
      }
    } catch (error) {
      logger.error('Payment confirm failed', { error: toErrorMessage(error) });
      Alert.alert(t('error'), toErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Header showBack title="Confirm payment" />
      <Text variant="caption" secondary style={{ marginBottom: 18 }}>
        Lacagta waxaa laga jari doonaa balance-kaaga Neon. Haddii ay fashilanto, waa laguu soo celinayaa.
      </Text>

      <View
        style={{
          borderRadius: radius['3xl'],
          backgroundColor: colors.navy[900],
          padding: 22,
          marginBottom: 18,
          ...elevation('lg', theme.mode),
        }}
      >
        <Text
          style={{
            fontFamily: 'Fraunces_600SemiBold',
            fontSize: 12,
            color: colors.gold[300],
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          Pay now
        </Text>
        <Text
          style={{
            fontFamily: 'Fraunces_600SemiBold',
            fontSize: 34,
            color: colors.white,
            marginBottom: 8,
          }}
        >
          {formatCurrency(item.amount)}
        </Text>
        <Text
          style={{
            fontFamily: 'DMSans_400Regular',
            fontSize: 14,
            color: 'rgba(255,255,255,0.75)',
            marginBottom: 14,
          }}
        >
          to {item.recipient}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Badge label={item.role} tone="gold" />
          <Badge label={item.status} tone="navy" />
        </View>
      </View>

      <View
        style={{
          borderRadius: radius['2xl'],
          backgroundColor: theme.card,
          padding: 16,
          marginBottom: 22,
          borderWidth: theme.mode === 'dark' ? 1 : 0,
          borderColor: theme.border,
          ...elevation('sm', theme.mode),
        }}
      >
        <Line label="Available balance" value={formatCurrency(wallet.available)} />
        <Line label="Payout" value={formatCurrency(item.amount)} />
        <Line
          label="After payment"
          value={formatCurrency(Math.max(0, wallet.available - item.amount))}
          last
        />
        {!canAfford ? (
          <Text
            variant="caption"
            style={{ marginTop: 12, color: theme.danger }}
          >
            {t('insufficientBalance')}
          </Text>
        ) : (
          <Text variant="caption" muted style={{ marginTop: 12 }}>
            Haddii payment-ku fashilmo, balance-kaaga dib ayaa loogu soo celinayaa.
          </Text>
        )}
      </View>

      <Button
        title="Confirm payment"
        fullWidth
        size="lg"
        loading={loading}
        disabled={!canAfford}
        onPress={() => run(false)}
      />
      <Button
        title="Simulate failure"
        fullWidth
        variant="outline"
        style={{ marginTop: 12 }}
        disabled={loading || !canAfford}
        onPress={() => run(true)}
      />
      <Button
        title="Back to summary"
        fullWidth
        variant="ghost"
        style={{ marginTop: 8 }}
        disabled={loading}
        onPress={() =>
          navigation.navigate(ROUTES.PaymentSummary, {
            distributionId: item.id,
          })
        }
      />
    </Screen>
  );
}

function Line({
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
      <Text
        style={{
          fontFamily: 'DMSans_700Bold',
          fontSize: 14,
          color: theme.text,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
