import { createAppStack } from '../createStack';
import { MarketplaceScreen } from '@/screens/tickets/MarketplaceScreen';
import { MarketplaceEventScreen } from '@/screens/tickets/MarketplaceEventScreen';
import { MockCheckoutScreen } from '@/screens/tickets/MockCheckoutScreen';
import { MyMarketplaceOrdersScreen } from '@/screens/tickets/MyMarketplaceOrdersScreen';
import { TicketsScreen } from '@/screens/tickets/TicketsScreen';
import { TicketWalletScreen } from '@/screens/tickets/TicketWalletScreen';
import { TicketDetailsScreen } from '@/screens/tickets/TicketDetailsScreen';
import { TicketStatusScreen } from '@/screens/tickets/TicketStatusScreen';
import { DownloadTicketScreen } from '@/screens/tickets/DownloadTicketScreen';
import { TicketHistoryScreen } from '@/screens/tickets/TicketHistoryScreen';
import { QrScannerScreen } from '@/screens/tickets/QrScannerScreen';
import { CheckInSuccessScreen } from '@/screens/tickets/CheckInSuccessScreen';
import { AlreadyUsedScreen } from '@/screens/tickets/AlreadyUsedScreen';
import type { TicketsStackParamList } from '../types';
import { ROUTES } from '@/constants/routes';
import { modalScreenOptions, successScreenOptions } from '../options';

const { AppStack } = createAppStack<TicketsStackParamList>();

export function TicketsStackNavigator() {
  return (
    <AppStack
      initialRouteName={ROUTES.TicketsMain}
      screens={[
        { name: ROUTES.TicketsMain, component: MarketplaceScreen },
        {
          name: ROUTES.MarketplaceEvent,
          component: MarketplaceEventScreen,
        },
        {
          name: ROUTES.MockCheckout,
          component: MockCheckoutScreen,
          options: modalScreenOptions,
        },
        {
          name: ROUTES.MyMarketplaceOrders,
          component: MyMarketplaceOrdersScreen,
        },
        { name: ROUTES.IssuedTickets, component: TicketsScreen },
        { name: ROUTES.TicketWallet, component: TicketWalletScreen },
        { name: ROUTES.TicketDetails, component: TicketDetailsScreen },
        { name: ROUTES.TicketStatus, component: TicketStatusScreen },
        { name: ROUTES.DownloadTicket, component: DownloadTicketScreen },
        { name: ROUTES.TicketHistory, component: TicketHistoryScreen },
        { name: ROUTES.QrScanner, component: QrScannerScreen },
        {
          name: ROUTES.CheckInSuccess,
          component: CheckInSuccessScreen,
          options: successScreenOptions,
        },
        {
          name: ROUTES.AlreadyUsed,
          component: AlreadyUsedScreen,
          options: successScreenOptions,
        },
      ]}
    />
  );
}
