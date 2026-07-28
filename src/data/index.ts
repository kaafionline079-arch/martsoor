import type {
  EventItem,
  Guest,
  GuestCategory,
  Invitation,
  Ticket,
  PaymentTransaction,
} from '@/types';

/** Static category metadata — counts come from live guest store. */
export const guestCategories: GuestCategory[] = [
  {
    id: 'vip',
    name: 'VIP',
    description: 'Priority guests',
    color: '#45AC4D',
    guestCount: 0,
  },
  {
    id: 'general',
    name: 'General',
    description: 'Standard guests',
    color: '#6B7280',
    guestCount: 0,
  },
  {
    id: 'family',
    name: 'Family',
    description: 'Family members',
    color: '#2563EB',
    guestCount: 0,
  },
  {
    id: 'media',
    name: 'Media',
    description: 'Press & media',
    color: '#7C3AED',
    guestCount: 0,
  },
  {
    id: 'staff',
    name: 'Staff',
    description: 'Event staff',
    color: '#DC2626',
    guestCount: 0,
  },
  {
    id: 'sponsor',
    name: 'Sponsor',
    description: 'Sponsors',
    color: '#D97706',
    guestCount: 0,
  },
  {
    id: 'speaker',
    name: 'Speaker',
    description: 'Speakers',
    color: '#0891B2',
    guestCount: 0,
  },
];

export const mockGuestCategories = guestCategories;

export function getEventById(
  events: EventItem[],
  id: string,
): EventItem | undefined {
  return events.find((e) => e.id === id);
}

export function getGuestById(
  guests: Guest[],
  id: string,
): Guest | undefined {
  return guests.find((g) => g.id === id);
}

export function getGuestsByEvent(guests: Guest[], eventId: string): Guest[] {
  return guests.filter((g) => g.eventId === eventId);
}

export function getTicketsByEvent(_eventId: string): Ticket[] {
  return [];
}

export function getInvitationsByEvent(_eventId: string): Invitation[] {
  return [];
}

export function getAttendanceForEvent(eventId: string) {
  return {
    eventId,
    eventTitle: '',
    date: '',
    invited: 0,
    confirmed: 0,
    declined: 0,
    checkedIn: 0,
    noShow: 0,
    attendanceRate: 0,
  };
}

export function getTransactionsByEvent(
  _eventId: string,
): PaymentTransaction[] {
  return [];
}

export function searchGuests(guests: Guest[], query: string): Guest[] {
  const q = query.trim().toLowerCase();
  if (!q) return guests;
  return guests.filter(
    (g) =>
      g.name.toLowerCase().includes(q) ||
      g.email.toLowerCase().includes(q) ||
      g.phone.toLowerCase().includes(q),
  );
}

export function searchEvents(events: EventItem[], query: string): EventItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return events;
  return events.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q),
  );
}
