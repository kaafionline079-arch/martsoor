export type EventStatus = 'draft' | 'upcoming' | 'live' | 'completed' | 'cancelled';

export type EventItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  coverImage: string;
  status: EventStatus;
  guestCount: number;
  ticketSold: number;
  capacity: number;
  budget: number;
  revenue?: number;
  category?: string;
};

export type GuestStatus = 'invited' | 'confirmed' | 'declined' | 'checked_in';

export type GuestCategoryId =
  | 'vip'
  | 'general'
  | 'family'
  | 'media'
  | 'staff'
  | 'sponsor'
  | 'speaker';

export type QrTicketStatus =
  | 'none'
  | 'pending'
  | 'active'
  | 'scanned'
  | 'expired'
  | 'revoked';

export type GuestCategory = {
  id: GuestCategoryId;
  name: string;
  description: string;
  color: string;
  guestCount: number;
};

export type InvitationStatus =
  | 'draft'
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'accepted'
  | 'declined'
  | 'expired';

export type Guest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: GuestStatus;
  eventId: string;
  eventTitle: string;
  table?: string;
  notes?: string;
  invitationStatus?: InvitationStatus;
  invitationChannel?: string;
  invitedAt?: string;
  respondedAt?: string;
  category?: GuestCategoryId;
  qrTicketStatus?: QrTicketStatus;
  qrCode?: string;
  /** Amount the host plans to send this guest */
  amount?: number;
};

export type Invitation = {
  id: string;
  guestId: string;
  guestName: string;
  eventId: string;
  eventTitle: string;
  email: string;
  status: InvitationStatus;
  channel: 'email' | 'sms' | 'whatsapp';
  sentAt: string;
  openedAt?: string;
  respondedAt?: string;
};

export type TicketStatus = 'valid' | 'used' | 'refunded' | 'expired';

export type Ticket = {
  id: string;
  code: string;
  eventId: string;
  eventTitle: string;
  guestId?: string;
  guestName: string;
  type: string;
  price: number;
  status: TicketStatus;
  purchasedAt: string;
};

/** Pass used by ticket wallet / QR / check-in flows */
export type TicketPassStatus =
  | 'valid'
  | 'used'
  | 'expired'
  | 'refunded'
  | 'reserved';

export type TicketHistoryKind =
  | 'issued'
  | 'purchased'
  | 'downloaded'
  | 'scanned'
  | 'checked_in'
  | 'already_used'
  | 'expired'
  | 'refunded'
  | 'status_changed';

export type TicketHistoryEvent = {
  id: string;
  ticketId: string;
  kind: TicketHistoryKind;
  message: string;
  at: string;
};

export type TicketPass = {
  id: string;
  code: string;
  qrPayload: string;
  eventId: string;
  eventTitle: string;
  coverImage?: string;
  guestName: string;
  type: string;
  price: number;
  status: TicketPassStatus;
  purchasedAt: string;
  scannedAt?: string;
  downloadedAt?: string;
  source: 'issued' | 'marketplace';
  /** Virtual card event details */
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  pricingMode?: TicketPricingMode;
};

export type CheckInResult =
  | 'success'
  | 'already_used'
  | 'not_found'
  | 'invalid';

/** Marketplace ticket tiers */
export type TicketTierId = 'vip' | 'regular' | 'student' | 'family';

export type TicketPricingMode = 'free' | 'paid';

export type MarketplaceTicketTier = {
  id: TicketTierId;
  name: string;
  pricingMode: TicketPricingMode;
  price: number;
  remaining: number;
  capacity: number;
  description: string;
};

export type MarketplaceListing = {
  id: string;
  eventId: string;
  title: string;
  description: string;
  coverImage: string;
  location: string;
  date: string;
  time: string;
  organizer: string;
  organizerAvatar?: string;
  category: string;
  status: EventStatus;
  startingPrice: number;
  remainingTickets: number;
  featured?: boolean;
  tiers: MarketplaceTicketTier[];
};

export type MarketplaceOrderStatus = 'reserved' | 'purchased' | 'cancelled';

export type MarketplaceOrder = {
  id: string;
  listingId: string;
  eventId: string;
  eventTitle: string;
  coverImage: string;
  tierId: TicketTierId;
  tierName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  pricingMode: TicketPricingMode;
  status: MarketplaceOrderStatus;
  buyerName: string;
  buyerEmail: string;
  createdAt: string;
  code: string;
};

export type PaymentTransaction = {
  id: string;
  title: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  eventId?: string;
  reference?: string;
};

export type DistributionItem = {
  id: string;
  recipient: string;
  role: string;
  amount: number;
  percent: number;
  status: 'scheduled' | 'paid' | 'pending';
  eventId?: string;
};

export type Wallet = {
  balance: number;
  available: number;
  pending: number;
  currency: string;
  lastUpdated: string;
  lifetimeRevenue: number;
  lifetimePayouts: number;
};

export type AttendanceEventStat = {
  eventId: string;
  eventTitle: string;
  date: string;
  invited: number;
  confirmed: number;
  declined: number;
  checkedIn: number;
  noShow: number;
  attendanceRate: number;
  capacity: number;
};

export type AttendanceSummary = {
  totalInvited: number;
  totalConfirmed: number;
  totalDeclined: number;
  totalCheckedIn: number;
  totalNoShow: number;
  averageAttendanceRate: number;
  byEvent: AttendanceEventStat[];
};

export type TicketSalesSummary = {
  totalTickets: number;
  totalRevenue: number;
  byType: { type: string; count: number; revenue: number }[];
  byStatus: { status: TicketStatus; count: number }[];
  byEvent: {
    eventId: string;
    eventTitle: string;
    sold: number;
    revenue: number;
    capacity: number;
  }[];
};

export type InvitationStats = {
  total: number;
  byStatus: Record<InvitationStatus, number>;
  byChannel: Record<'email' | 'sms' | 'whatsapp', number>;
  acceptanceRate: number;
  openRate: number;
};

export type ReportPeriod = {
  id: string;
  label: string;
  from: string;
  to: string;
  eventsHeld: number;
  guestsHosted: number;
  ticketsSold: number;
  revenue: number;
  expenses: number;
  net: number;
  attendanceRate: number;
};

export type ReportsBundle = {
  generatedAt: string;
  periods: ReportPeriod[];
  topEvents: {
    eventId: string;
    title: string;
    revenue: number;
    attendanceRate: number;
  }[];
  highlights: string[];
};
