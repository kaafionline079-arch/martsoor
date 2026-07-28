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
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/format';
import { ROUTES } from '@/constants/routes';
import type { PaymentsStackParamList } from '@/navigation/types';

export function PaymentSuccessScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<PaymentsStackParamList>>();
  const route = useRoute<RouteProp<PaymentsStackParamList, 'PaymentSuccess'>>();
  const theme = useTheme();
  const attempt = usePaymentAttempt(route.params.paymentId);

  return (
    <Screen scroll>
      <Header showBack title="Payment success" />

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
          <SuccessBurst tone="success" />
          <Text
            style={{
              fontFamily: 'Fraunces_600SemiBold',
              fontSize: 28,
              color: theme.text,
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Payment successful
          </Text>
          <Text
            variant="body"
            secondary
            style={{ textAlign: 'center', marginBottom: 18 }}
          >
            Lacagta waa la bixiyay si guul leh. Balance-kaaga Neon waa la cusbooneysiiyay.
          </Text>
          {attempt ? (
            <FadeInView delay={120} variant="up">
              <Text
                style={{
                  fontFamily: 'DMSans_700Bold',
                  fontSize: 28,
                  color: colors.gold[600],
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
                {attempt.role} · {attempt.reference}
              </Text>
              <Text
                variant="caption"
                muted
                style={{ marginTop: 8, textAlign: 'center' }}
              >
                {formatDate(attempt.createdAt)}
              </Text>
            </FadeInView>
          ) : null}
        </View>
      </FadeInView>

      <FadeInView delay={180} style={{ gap: 12 }}>
        <Button
          title="Payment history"
          fullWidth
          onPress={() => navigation.navigate(ROUTES.History)}
        />
        <Button
          title="Distribution list"
          fullWidth
          variant="outline"
          onPress={() => navigation.navigate(ROUTES.Distribution)}
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
