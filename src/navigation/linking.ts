import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';
import { ROUTES } from '@/constants/routes';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['martisoor://'],
  config: {
    screens: {
      [ROUTES.Auth]: {
        screens: {
          Welcome: 'welcome',
          Login: 'login',
          Register: 'register',
        },
      },
      [ROUTES.Main]: {
        screens: {
          Home: {
            screens: { HomeMain: 'home', Notifications: 'notifications' },
          },
          Events: {
            screens: {
              EventsList: 'events',
              CreateEvent: 'events/create',
              EditEvent: 'events/:eventId/edit',
              DeleteEvent: 'events/:eventId/delete',
              EventDetails: 'events/:eventId',
              EventGuests: 'events/:eventId/guests',
              GuestDetails: 'events/guests/:guestId',
              RegisterGuest: 'events/:eventId/guests/add',
              ExcelUpload: 'events/:eventId/guests/upload',
              Invitation: 'events/invite',
              QrScanner: 'events/check-in',
              CheckInSuccess: 'events/check-in/ok',
              AlreadyUsed: 'events/check-in/used',
            },
          },
          Tickets: {
            screens: {
              TicketsMain: 'tickets',
              TicketWallet: 'tickets/wallet',
              TicketDetails: 'tickets/pass/:ticketId',
              QrScanner: 'tickets/scan',
              CheckInSuccess: 'tickets/check-in',
              AlreadyUsed: 'tickets/already-used',
            },
          },
          Payments: {
            screens: {
              Balance: 'payments',
              Distribution: 'payments/distribution',
              History: 'payments/history',
            },
          },
          Profile: {
            screens: {
              ProfileMain: 'profile',
              EditProfile: 'profile/edit',
              Settings: 'settings',
            },
          },
        },
      },
    },
  },
};
