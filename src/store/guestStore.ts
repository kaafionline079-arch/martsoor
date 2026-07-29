import { create } from 'zustand';
import { guestsApi } from '@/api';
import { isMockMode } from '@/constants/mockAuth';
import type {
  Guest,
  GuestCategoryId,
  GuestStatus,
  InvitationStatus,
  QrTicketStatus,
} from '@/types';

export type GuestDraft = {
  name: string;
  email: string;
  phone: string;
  eventId: string;
  eventTitle: string;
  category: GuestCategoryId;
  table?: string;
  notes?: string;
  status?: GuestStatus;
  invitationStatus?: InvitationStatus;
  qrTicketStatus?: QrTicketStatus;
  amount?: number;
};

type GuestState = {
  guests: Guest[];
  loading: boolean;
  hydrated: boolean;
  fetchGuests: (eventId?: string) => Promise<void>;
  createGuest: (draft: GuestDraft) => Promise<Guest>;
  updateGuest: (id: string, patch: Partial<Guest>) => Promise<void>;
  deleteGuest: (id: string) => Promise<void>;
  inviteGuest: (id: string, channel: 'whatsapp' | 'sms') => Promise<{
    guest: Guest;
    inviteText: string;
    message: string;
    channel: 'whatsapp' | 'sms';
  }>;
  inviteAll: (
    eventId: string,
    channel: 'whatsapp' | 'sms',
  ) => Promise<{ sent: number; message: string }>;
  importGuests: (rows: GuestDraft[]) => Promise<number>;
};

function localGuestFromDraft(draft: GuestDraft): Guest {
  return {
    id: `gst-mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: draft.name,
    email: draft.email || '',
    phone: draft.phone || '',
    avatar: '',
    status: draft.status || 'invited',
    eventId: draft.eventId,
    eventTitle: draft.eventTitle || '',
    notes: draft.notes || '',
    category: draft.category || 'general',
    invitationStatus: draft.invitationStatus || 'draft',
    qrTicketStatus: draft.qrTicketStatus || 'none',
    amount: draft.amount ?? 0,
  };
}

export const useGuestStore = create<GuestState>((set, get) => ({
  guests: [],
  loading: false,
  hydrated: false,
  fetchGuests: async (eventId) => {
    if (isMockMode) {
      set({ hydrated: true, loading: false });
      return;
    }
    set({ loading: true });
    try {
      const { guests } = await guestsApi.list(eventId);
      set({ guests, hydrated: true, loading: false });
    } catch (e) {
      set({ loading: false, hydrated: true });
      throw e;
    }
  },
  createGuest: async (draft) => {
    if (isMockMode) {
      const guest = localGuestFromDraft(draft);
      set((state) => ({ guests: [guest, ...state.guests] }));
      return guest;
    }
    const { guest } = await guestsApi.create(draft.eventId, draft);
    set((state) => ({ guests: [guest, ...state.guests] }));
    return guest;
  },
  updateGuest: async (id, patch) => {
    if (isMockMode) {
      set((state) => ({
        guests: state.guests.map((g) => (g.id === id ? { ...g, ...patch } : g)),
      }));
      return;
    }
    const { guest } = await guestsApi.update(id, patch);
    set((state) => ({
      guests: state.guests.map((g) => (g.id === id ? guest : g)),
    }));
  },
  deleteGuest: async (id) => {
    if (isMockMode) {
      set((state) => ({
        guests: state.guests.filter((g) => g.id !== id),
      }));
      return;
    }
    await guestsApi.remove(id);
    set((state) => ({
      guests: state.guests.filter((g) => g.id !== id),
    }));
  },
  inviteGuest: async (id, channel) => {
    if (isMockMode) {
      const guest = get().guests.find((g) => g.id === id);
      if (!guest) {
        throw new Error('Guest not found');
      }
      const updated: Guest = {
        ...guest,
        invitationStatus: 'sent',
        status: 'invited',
      };
      const inviteText = `Martisoor invite (${channel}): ${guest.eventTitle || 'Event'} — ${guest.name}`;
      set((state) => ({
        guests: state.guests.map((g) => (g.id === id ? updated : g)),
      }));
      return {
        guest: updated,
        inviteText,
        message: 'Invitation mock ayaa la diray.',
        channel,
      };
    }
    const res = await guestsApi.invite(id, channel);
    set((state) => ({
      guests: state.guests.map((g) => (g.id === id ? res.guest : g)),
    }));
    return {
      guest: res.guest,
      inviteText: res.inviteText,
      message: res.message,
      channel: res.channel,
    };
  },
  inviteAll: async (eventId, channel) => {
    if (isMockMode) {
      const list = get().guests.filter((g) => g.eventId === eventId);
      set((state) => ({
        guests: state.guests.map((g) =>
          g.eventId === eventId
            ? { ...g, invitationStatus: 'sent', status: 'invited' }
            : g,
        ),
      }));
      return {
        sent: list.length,
        message: `${list.length} marti (${channel}) mock ayaa la casuumay.`,
      };
    }
    const res = await guestsApi.inviteAll(eventId, channel);
    await get().fetchGuests(eventId);
    return { sent: res.sent, message: res.message };
  },
  importGuests: async (rows) => {
    let count = 0;
    for (const draft of rows) {
      await get().createGuest(draft);
      count += 1;
    }
    return count;
  },
}));
