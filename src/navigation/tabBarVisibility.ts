import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute, type Route } from '@react-navigation/native';

const HIDDEN_TAB_ROUTES = new Set([
  'CreateEvent',
  'EditEvent',
  'DeleteEvent',
  'EventDetails',
  'EventGuests',
  'GuestDetails',
  'RegisterGuest',
  'ExcelUpload',
  'Invitation',
  'QrScanner',
  'CheckInSuccess',
  'AlreadyUsed',
  'MarketplaceEvent',
  'MockCheckout',
  'MyMarketplaceOrders',
  'IssuedTickets',
  'TicketWallet',
  'TicketDetails',
  'TicketStatus',
  'DownloadTicket',
  'TicketHistory',
  'Distribution',
  'History',
  'PaymentSummary',
  'PaymentConfirm',
  'PaymentSuccess',
  'PaymentFailed',
  'EditProfile',
  'Settings',
  'Notifications',
]);

export function getTabBarVisibility(
  route: Partial<Route<string>>,
): BottomTabNavigationOptions['tabBarStyle'] | undefined {
  const routeName = getFocusedRouteNameFromRoute(route);
  if (routeName && HIDDEN_TAB_ROUTES.has(routeName)) {
    return { display: 'none' };
  }
  return undefined;
}
