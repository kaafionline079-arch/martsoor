import { View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { FadeInView } from '@/components/shared/FadeInView';
import { WalletSkeleton } from '@/components/ui/Skeleton';
import { useWallet } from '@/features/wallet/hooks';
import { useWalletStore } from '@/store/walletStore';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/useTheme';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/format';
import { ROUTES } from '@/constants/routes';
import type { PaymentsStackParamList } from '@/navigation/types';

export function BalanceScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<PaymentsStackParamList>>();
  const theme = useTheme();
  const { t } = useI18n();
  const wallet = useWallet();
  const hydrated = useWalletStore((s) => s.hydrated);
  const paymentAccount = useWalletStore((s) => s.paymentAccount);

  if (!hydrated) {
    return (
      <Screen padded={false}>
        <WalletSkeleton />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <FadeInView>
        <Text variant="h1" style={{ marginTop: 8, marginBottom: 4 }}>
          Wallet
        </Text>
        <Text variant="caption" secondary style={{ marginBottom: 20 }}>
          Balance-kaaga · Connect account · History
        </Text>
      </FadeInView>

      <View
        style={{
          borderRadius: radius['3xl'],
          backgroundColor: colors.navy[900],
          padding: 22,
          marginBottom: 16,
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
            marginBottom: 8,
          }}
        >
          Balance
        </Text>
        <Text
          style={{
            fontFamily: 'Fraunces_600SemiBold',
            fontSize: 36,
            color: colors.white,
            marginBottom: 12,
          }}
        >
          {formatCurrency(wallet.balance)}
        </Text>
        <Text
          style={{
            fontFamily: 'DMSans_400Regular',
            fontSize: 12,
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          Updated {formatDate(wallet.lastUpdated)}
        </Text>
      </View>

      {paymentAccount ? (
        <View
          style={{
            borderRadius: radius['2xl'],
            backgroundColor: theme.card,
            padding: 14,
            marginBottom: 16,
            borderWidth: theme.mode === 'dark' ? 1 : 0,
            borderColor: theme.border,
          }}
        >
          <Text variant="caption" muted>
            Connected
          </Text>
          <Text variant="bodyMedium" style={{ marginTop: 4 }}>
            {paymentAccount.provider === 'salaam'
              ? 'Salaam Bank'
              : 'Merchant Account'}{' '}
            · {paymentAccount.accountNumber}
          </Text>
        </View>
      ) : (
        <Text variant="caption" secondary style={{ marginBottom: 16 }}>
          Ku xir account si aad balance u hesho. Lacagta guests-ka waxaad ka
          dirtaa Event → Guests.
        </Text>
      )}

      <View style={{ gap: 10 }}>
        <Button
          title={t('connectAccount')}
          fullWidth
          size="lg"
          onPress={() => navigation.navigate(ROUTES.ConnectAccount)}
        />
        <Button
          title="History"
          fullWidth
          variant="outline"
          onPress={() => navigation.navigate(ROUTES.History)}
        />
      </View>
    </Screen>
  );
}
