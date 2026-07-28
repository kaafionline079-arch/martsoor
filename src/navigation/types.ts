import type { NavigatorScreenParams } from '@react-navigation/native';
import type { TicketTierId } from '@/types';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  Notifications: undefined;
};

/** Events owns Guests / Invite / Check-in (no Guests tab). */
export type EventsStackParamList = {
  EventsList: undefined;
  CreateEvent: { category?: string } | undefined;
  EditEvent: { eventId: string };
  DeleteEvent: { eventId: string };
  EventDetails: { eventId: string };
  EventGuests: { eventId: string };
  GuestDetails: { guestId: string; eventId?: string };
  RegisterGuest: { eventId: string };
  ExcelUpload: { eventId: string };
  Invitation: { guestId?: string; eventId?: string };
  QrScanner: { eventId?: string };
  CheckInSuccess: { ticketId: string };
  AlreadyUsed: {
    ticketId?: string;
    reason?: 'already_used' | 'not_found' | 'invalid';
  };
};

/** @deprecated Guests live under Events — kept for type refs during migration */
export type GuestsStackParamList = EventsStackParamList;

export type TicketsStackParamList = {
  TicketsMain: undefined;
  MarketplaceEvent: { listingId: string };
  MockCheckout: {
    listingId: string;
    tierId: TicketTierId;
    mode: 'reserve' | 'buy';
  };
  MyMarketplaceOrders: undefined;
  IssuedTickets: undefined;
  TicketWallet: undefined;
  TicketDetails: { ticketId: string };
  TicketStatus: { ticketId: string };
  DownloadTicket: { ticketId: string };
  TicketHistory: { ticketId?: string };
  QrScanner: undefined;
  CheckInSuccess: { ticketId: string };
  AlreadyUsed: {
    ticketId?: string;
    reason?: 'already_used' | 'not_found' | 'invalid';
  };
};

export type PaymentsStackParamList = {
  Balance: undefined;
  Distribution: undefined;
  History: undefined;
  PaymentSummary: { distributionId?: string };
  PaymentConfirm: { distributionId: string };
  PaymentSuccess: { paymentId: string };
  PaymentFailed: { paymentId?: string };
  ConnectAccount: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Events: NavigatorScreenParams<EventsStackParamList>;
  Tickets: NavigatorScreenParams<TicketsStackParamList>;
  Payments: NavigatorScreenParams<PaymentsStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
