export const ROUTES = {
  // Auth
  Welcome: 'Welcome',
  Login: 'Login',
  Register: 'Register',

  // Root
  Auth: 'Auth',
  Main: 'Main',

  // Tabs
  Home: 'Home',
  Events: 'Events',
  Guests: 'Guests',
  Tickets: 'Tickets',
  Payments: 'Payments',
  Profile: 'Profile',

  // Home stack
  HomeMain: 'HomeMain',
  Notifications: 'Notifications',

  // Events stack
  EventsList: 'EventsList',
  CreateEvent: 'CreateEvent',
  EditEvent: 'EditEvent',
  DeleteEvent: 'DeleteEvent',
  EventDetails: 'EventDetails',
  EventGallery: 'EventGallery',
  EventGuests: 'EventGuests',
  EventAttendance: 'EventAttendance',
  EventStatistics: 'EventStatistics',

  // Guests stack
  GuestList: 'GuestList',
  GuestDetails: 'GuestDetails',
  RegisterGuest: 'RegisterGuest',
  ExcelUpload: 'ExcelUpload',
  GuestCategories: 'GuestCategories',
  Invitation: 'Invitation',

  // Tickets stack
  TicketsMain: 'TicketsMain',
  MarketplaceEvent: 'MarketplaceEvent',
  MockCheckout: 'MockCheckout',
  MyMarketplaceOrders: 'MyMarketplaceOrders',
  IssuedTickets: 'IssuedTickets',
  TicketWallet: 'TicketWallet',
  TicketDetails: 'TicketDetails',
  TicketStatus: 'TicketStatus',
  DownloadTicket: 'DownloadTicket',
  TicketHistory: 'TicketHistory',
  QrScanner: 'QrScanner',
  CheckInSuccess: 'CheckInSuccess',
  AlreadyUsed: 'AlreadyUsed',

  // Payments stack
  Balance: 'Balance',
  Distribution: 'Distribution',
  History: 'History',
  PaymentSummary: 'PaymentSummary',
  PaymentConfirm: 'PaymentConfirm',
  PaymentSuccess: 'PaymentSuccess',
  PaymentFailed: 'PaymentFailed',
  ConnectAccount: 'ConnectAccount',

  // Profile stack
  ProfileMain: 'ProfileMain',
  EditProfile: 'EditProfile',
  Settings: 'Settings',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];
