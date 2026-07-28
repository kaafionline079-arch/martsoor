import type {
  EventItem,
  Guest,
  PaymentTransaction,
} from '@/types';

export type DashboardMetrics = {
  totalEvents: number;
  upcomingEvents: number;
  todaysGuests: number;
  attendanceRate: number;
  checkedIn: number;
  confirmed: number;
  walletBalance: number;
  walletAvailable: number;
  walletPending: number;
};

export type DashboardActivity = {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  tone: 'gold' | 'navy' | 'success' | 'danger' | 'muted';
  icon: 'calendar' | 'people' | 'ticket' | 'wallet' | 'mail';
};

export type DashboardSource = {
  events: EventItem[];
  guests: Guest[];
  transactions: PaymentTransaction[];
  wallet: {
    balance: number;
    available: number;
    pending: number;
  };
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function isToday(date: string, today = todayKey()) {
  return date.slice(0, 10) === today;
}

export function getDashboardMetrics(source: DashboardSource): DashboardMetrics {
  const today = todayKey();
  const upcomingEvents = source.events.filter(
    (e) => e.status === 'upcoming',
  ).length;
  const todaysEventIds = new Set(
    source.events.filter((e) => isToday(e.date, today)).map((e) => e.id),
  );
  const todaysGuests = source.guests.filter((g) =>
    todaysEventIds.has(g.eventId),
  ).length;
  const checkedIn = source.guests.filter((g) => g.status === 'checked_in').length;
  const confirmed = source.guests.filter(
    (g) => g.status === 'confirmed' || g.status === 'checked_in',
  ).length;
  const total = source.guests.length || 1;

  return {
    totalEvents: source.events.length,
    upcomingEvents,
    todaysGuests,
    attendanceRate: Math.round((checkedIn / total) * 100),
    checkedIn,
    confirmed,
    walletBalance: source.wallet.balance,
    walletAvailable: source.wallet.available,
    walletPending: source.wallet.pending,
  };
}

export function getUpcomingEvents(
  events: EventItem[],
  limit = 4,
): EventItem[] {
  return events
    .filter((e) => e.status === 'upcoming' || e.status === 'live')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

export function getRecentPayments(
  transactions: PaymentTransaction[],
  limit = 6,
): PaymentTransaction[] {
  return [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export function getTodaysGuestsPreview(
  events: EventItem[],
  guests: Guest[],
  limit = 5,
): Guest[] {
  const today = todayKey();
  const metricsDateEvents = events.filter((e) => isToday(e.date, today));
  const ids = new Set(
    (metricsDateEvents.length
      ? metricsDateEvents
      : events.filter((e) => e.status === 'live' || e.status === 'upcoming')
    ).map((e) => e.id),
  );

  return guests.filter((g) => ids.has(g.eventId)).slice(0, limit);
}

export function getRecentActivities(
  source: DashboardSource,
  limit = 8,
): DashboardActivity[] {
  const activities: DashboardActivity[] = [];
  const today = todayKey();

  for (const txn of getRecentPayments(source.transactions, 4)) {
    activities.push({
      id: `act-${txn.id}`,
      title: txn.title,
      subtitle: `${txn.type === 'credit' ? 'Credit' : 'Debit'} · ${txn.category}`,
      time: txn.date,
      tone: txn.type === 'credit' ? 'success' : 'danger',
      icon: 'wallet',
    });
  }

  for (const guest of source.guests
    .filter((g) => g.status === 'checked_in')
    .slice(0, 3)) {
    activities.push({
      id: `act-checkin-${guest.id}`,
      title: 'Guest checked in',
      subtitle: `${guest.name} · ${guest.eventTitle}`,
      time: guest.respondedAt ?? guest.invitedAt ?? today,
      tone: 'success',
      icon: 'people',
    });
  }

  for (const event of source.events.slice(0, 3)) {
    activities.push({
      id: `act-evt-${event.id}`,
      title: event.title,
      subtitle: `${event.guestCount} guests · ${event.location}`,
      time: event.date,
      tone: 'gold',
      icon: 'calendar',
    });
  }

  return activities
    .sort((a, b) => (a.time < b.time ? 1 : -1))
    .slice(0, limit);
}
