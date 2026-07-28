import { useEffect, useMemo } from 'react';
import { useEventStore } from '@/store/eventStore';
import { useGuestStore } from '@/store/guestStore';
import { useWalletStore } from '@/store/walletStore';
import { useTicketPassStore } from '@/store/ticketPassStore';
import { useAuthStore } from '@/store/authStore';
import {
  getDashboardMetrics,
  getRecentActivities,
  getRecentPayments,
  getTodaysGuestsPreview,
  getUpcomingEvents,
} from './selectors';

/** Dashboard loads live API-backed stores. */
export function useDashboardData() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const events = useEventStore((s) => s.events);
  const guests = useGuestStore((s) => s.guests);
  const transactions = useWalletStore((s) => s.transactions);
  const wallet = useWalletStore((s) => s.wallet);
  const fetchEvents = useEventStore((s) => s.fetchEvents);
  const fetchGuests = useGuestStore((s) => s.fetchGuests);
  const fetchWallet = useWalletStore((s) => s.fetchWallet);
  const fetchPasses = useTicketPassStore((s) => s.fetchPasses);

  useEffect(() => {
    if (!isAuthenticated) return;
    void Promise.allSettled([
      fetchEvents(),
      fetchGuests(),
      fetchWallet(),
      fetchPasses(),
    ]);
  }, [isAuthenticated, fetchEvents, fetchGuests, fetchWallet, fetchPasses]);

  return useMemo(() => {
    const source = { events, guests, transactions, wallet };
    return {
      metrics: getDashboardMetrics(source),
      upcoming: getUpcomingEvents(events, 4),
      payments: getRecentPayments(transactions, 5),
      activities: getRecentActivities(source, 8),
      todaysGuests: getTodaysGuestsPreview(events, guests, 5),
    };
  }, [events, guests, transactions, wallet]);
}
