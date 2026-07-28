import { useMemo } from 'react';
import {
  getAttendanceForEvent,
  getInvitationsByEvent,
  getTicketsByEvent,
  getTransactionsByEvent,
} from '@/data';
import { useEventStore } from '@/store/eventStore';
import { useGuestStore } from '@/store/guestStore';
import { useTicketPassStore } from '@/store/ticketPassStore';
import type { EventItem, EventStatus } from '@/types';

const GALLERY_POOL = [
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000&q=80',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1000&q=80',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1000&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&q=80',
  'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1000&q=80',
  'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1000&q=80',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1000&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000&q=80',
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=1000&q=80',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1000&q=80',
  'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1000&q=80',
];

export function useEvents(filter?: EventStatus | 'all') {
  const events = useEventStore((s) => s.events);
  return useMemo(() => {
    const list = [...events].sort((a, b) => b.date.localeCompare(a.date));
    if (!filter || filter === 'all') return list;
    return list.filter((e) => e.status === filter);
  }, [events, filter]);
}

export function useEvent(eventId: string) {
  return useEventStore((s) => s.events.find((e) => e.id === eventId));
}

export function getEventGallery(event: EventItem): string[] {
  const seed = Number(event.id.replace(/\D/g, '')) || 1;
  const images = [event.coverImage];
  for (let i = 0; i < 8; i++) {
    const url = GALLERY_POOL[(seed + i) % GALLERY_POOL.length] ?? GALLERY_POOL[0];
    if (url && !images.includes(url)) images.push(url);
  }
  return images;
}

export function useEventModuleData(eventId: string) {
  const event = useEvent(eventId);
  const allGuests = useGuestStore((s) => s.guests);
  const passes = useTicketPassStore((s) => s.passes);

  return useMemo(() => {
    if (!event) {
      return null;
    }

    const guests = allGuests.filter((g) => g.eventId === eventId);
    const tickets = passes
      .filter((p) => p.eventId === eventId)
      .map((p) => ({
        id: p.id,
        code: p.code,
        eventId: p.eventId,
        eventTitle: p.eventTitle,
        guestId: undefined,
        guestName: p.guestName,
        type: p.type,
        price: p.price,
        status: p.status === 'used' ? 'used' : 'valid',
        purchasedAt: p.purchasedAt,
      }));
    const invitations = getInvitationsByEvent(eventId);
    const attendance = {
      ...getAttendanceForEvent(eventId),
      invited: guests.filter((g) => g.status === 'invited').length,
      confirmed: guests.filter(
        (g) => g.status === 'confirmed' || g.status === 'checked_in',
      ).length,
      declined: guests.filter((g) => g.status === 'declined').length,
      checkedIn: guests.filter((g) => g.status === 'checked_in').length,
      attendanceRate:
        guests.length === 0
          ? 0
          : Math.round(
              (guests.filter((g) => g.status === 'checked_in').length /
                guests.length) *
                100,
            ),
    };
    const transactions = getTransactionsByEvent(eventId);
    const gallery = getEventGallery(event);

    const confirmed = guests.filter(
      (g) => g.status === 'confirmed' || g.status === 'checked_in',
    ).length;
    const declined = guests.filter((g) => g.status === 'declined').length;
    const checkedIn = guests.filter((g) => g.status === 'checked_in').length;
    const invited = guests.filter((g) => g.status === 'invited').length;

    const ticketRevenue = tickets
      .filter((t) => t.status !== 'refunded')
      .reduce((s, t) => s + t.price, 0);
    const expenses = transactions
      .filter((t) => t.type === 'debit' && t.status === 'completed')
      .reduce((s, t) => s + t.amount, 0);

    return {
      event,
      guests,
      tickets,
      invitations,
      attendance,
      transactions,
      gallery,
      guestCount: {
        total: guests.length,
        invited,
        confirmed,
        declined,
        checkedIn,
        capacity: event.capacity,
        fillRate:
          event.capacity === 0
            ? 0
            : Math.round((guests.length / event.capacity) * 100),
      },
      stats: {
        ticketSold: tickets.filter((t) => t.status !== 'refunded').length,
        ticketRevenue,
        expenses,
        net: ticketRevenue - expenses,
        invitationAccepted: invitations.filter((i) => i.status === 'accepted')
          .length,
        invitationDeclined: invitations.filter((i) => i.status === 'declined')
          .length,
        attendanceRate: attendance?.attendanceRate ?? 0,
      },
    };
  }, [allGuests, event, eventId, passes]);
}
