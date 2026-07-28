import { createAppStack } from '../createStack';
import { BalanceScreen } from '@/screens/payments/BalanceScreen';
import { DistributionScreen } from '@/screens/payments/DistributionScreen';
import { HistoryScreen } from '@/screens/payments/HistoryScreen';
import { PaymentSummaryScreen } from '@/screens/payments/PaymentSummaryScreen';
import { PaymentConfirmScreen } from '@/screens/payments/PaymentConfirmScreen';
import { PaymentSuccessScreen } from '@/screens/payments/PaymentSuccessScreen';
import { PaymentFailedScreen } from '@/screens/payments/PaymentFailedScreen';
import { ConnectAccountScreen } from '@/screens/payments/ConnectAccountScreen';
import type { PaymentsStackParamList } from '../types';
import { ROUTES } from '@/constants/routes';
import { modalScreenOptions, successScreenOptions } from '../options';

const { AppStack } = createAppStack<PaymentsStackParamList>();

export function PaymentsStackNavigator() {
  return (
    <AppStack
      initialRouteName={ROUTES.Balance}
      screens={[
        { name: ROUTES.Balance, component: BalanceScreen },
        { name: ROUTES.Distribution, component: DistributionScreen },
        { name: ROUTES.History, component: HistoryScreen },
        { name: ROUTES.PaymentSummary, component: PaymentSummaryScreen },
        {
          name: ROUTES.PaymentConfirm,
          component: PaymentConfirmScreen,
          options: modalScreenOptions,
        },
        {
          name: ROUTES.PaymentSuccess,
          component: PaymentSuccessScreen,
          options: successScreenOptions,
        },
        {
          name: ROUTES.PaymentFailed,
          component: PaymentFailedScreen,
          options: successScreenOptions,
        },
        {
          name: ROUTES.ConnectAccount,
          component: ConnectAccountScreen,
        },
      ]}
    />
  );
}
