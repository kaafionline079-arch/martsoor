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
import { Button } from '@/components/ui/Button';
import { FadeInView } from '@/components/shared/FadeInView';
import { SuccessBurst } from '@/components/shared/SuccessBurst';
import { usePaymentAttempt } from '@/features/wallet/hooks';
import { useTheme } from '@/hooks/useTheme';
import { elevation, radius } from '@/theme';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/format';
import { ROUTES } from '@/constants/routes';
import type { PaymentsStackParamList } from '@/navigation/types';

export function PaymentFailedScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<PaymentsStackParamList>>();
  const route = useRoute<RouteProp<PaymentsStackParamList, 'PaymentFailed'>>();
  const theme = useTheme();
  const attempt = usePaymentAttempt(route.params.paymentId ?? '');

  return (
    <Screen scroll>
      <Header showBack title="Payment failed" />

      <FadeInView>
        <View
          style={{
            alignItems: 'center',
            borderRadius: radius['3xl'],
            backgroundColor: theme.card,
            paddingVertical: 32,
            paddingHorizontal: 20,
            borderWidth: theme.mode === 'dark' ? 1 : 0,
            borderColor: theme.border,
            ...elevation('md', theme.mode),
            marginBottom: 22,
          }}
        >
          <SuccessBurst tone="danger" />
          <Text
            style={{
              fontFamily: 'Fraunces_600SemiBold',
              fontSize: 28,
              color: theme.text,
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Payment failed
          </Text>
          <Text
            variant="body"
            secondary
            style={{ textAlign: 'center', marginBottom: 18 }}
          >
            {attempt?.failureReason ??
              'Lacag-bixintu way fashilantay. Balance-kaaga waa laguu soo celiyay — waxba lagama jarin.'}
          </Text>
          {attempt ? (
            <FadeInView delay={120}>
              <Text
                style={{
                  fontFamily: 'DMSans_700Bold',
                  fontSize: 24,
                  color: theme.text,
                  marginBottom: 8,
                  textAlign: 'center',
                }}
              >
                {formatCurrency(attempt.amount)}
              </Text>
              <Text variant="bodyMedium" style={{ textAlign: 'center' }}>
                {attempt.recipient}
              </Text>
              <Text
                variant="caption"
                muted
                style={{ marginTop: 4, textAlign: 'center' }}
              >
                {attempt.reference} · {formatDate(attempt.createdAt)}
              </Text>
            </FadeInView>
          ) : null}
        </View>
      </FadeInView>

      <FadeInView delay={180} style={{ gap: 12 }}>
        {attempt ? (
          <Button
            title="Try again"
            fullWidth
            onPress={() =>
              navigation.replace(ROUTES.PaymentConfirm, {
                distributionId: attempt.distributionId,
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
        <Button
          title="Wallet balance"
          fullWidth
          variant="ghost"
          onPress={() => navigation.navigate(ROUTES.Balance)}
        />
      </FadeInView>
    </Screen>
  );
}
