import { useMemo } from 'react';
import { useGuestStore } from '@/store/guestStore';
import { useTicketPassStore } from '@/store/ticketPassStore';
import { mockGuestCategories } from '@/data';
import type {
  Guest,
  GuestCategoryId,
  GuestStatus,
  InvitationStatus,
  QrTicketStatus,
} from '@/types';

export type GuestFilters = {
  query: string;
  status: GuestStatus | 'all';
  category: GuestCategoryId | 'all';
  invitation: InvitationStatus | 'all';
  qrStatus: QrTicketStatus | 'all';
  eventId: string | 'all';
};

export const defaultGuestFilters: GuestFilters = {
  query: '',
  status: 'all',
  category: 'all',
  invitation: 'all',
  qrStatus: 'all',
  eventId: 'all',
};

export function useGuests(filters: GuestFilters = defaultGuestFilters) {
  const guests = useGuestStore((s) => s.guests);

  return useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return guests.filter((g) => {
      if (filters.status !== 'all' && g.status !== filters.status) return false;
      if (filters.category !== 'all' && g.category !== filters.category)
        return false;
      if (
        filters.invitation !== 'all' &&
        (g.invitationStatus ?? 'draft') !== filters.invitation
      )
        return false;
      if (
        filters.qrStatus !== 'all' &&
        (g.qrTicketStatus ?? 'none') !== filters.qrStatus
      )
        return false;
      if (filters.eventId !== 'all' && g.eventId !== filters.eventId)
        return false;
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.phone.toLowerCase().includes(q) ||
        g.eventTitle.toLowerCase().includes(q) ||
        (g.qrCode?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [guests, filters]);
}

export function useGuest(guestId: string) {
  return useGuestStore((s) => s.guests.find((g) => g.id === guestId));
}

export function useGuestCategories() {
  const guests = useGuestStore((s) => s.guests);
  return useMemo(
    () =>
      mockGuestCategories.map((cat) => ({
        ...cat,
        guestCount: guests.filter((g) => g.category === cat.id).length,
      })),
    [guests],
  );
}

export function getGuestTicket(guest: Guest) {
  const passes = useTicketPassStore.getState().passes;
  const pass = passes.find(
    (p) => p.code === guest.qrCode || p.guestName === guest.name,
  );
  if (!pass) return undefined;
  return {
    id: pass.id,
    code: pass.code,
    eventId: pass.eventId,
    eventTitle: pass.eventTitle,
    guestId: guest.id,
    guestName: pass.guestName,
    type: pass.type,
    price: pass.price,
    status: pass.status === 'used' ? 'used' : 'valid',
    purchasedAt: pass.purchasedAt,
  } as const;
}

export function getCategoryMeta(id?: GuestCategoryId) {
  return mockGuestCategories.find((c) => c.id === id);
}
