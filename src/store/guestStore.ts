import { create } from 'zustand';
import { guestsApi } from '@/api';
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

export const useGuestStore = create<GuestState>((set, get) => ({
  guests: [],
  loading: false,
  hydrated: false,
  fetchGuests: async (eventId) => {
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
    const { guest } = await guestsApi.create(draft.eventId, draft);
    set((state) => ({ guests: [guest, ...state.guests] }));
    return guest;
  },
  updateGuest: async (id, patch) => {
    const { guest } = await guestsApi.update(id, patch);
    set((state) => ({
      guests: state.guests.map((g) => (g.id === id ? guest : g)),
    }));
  },
  deleteGuest: async (id) => {
    await guestsApi.remove(id);
    set((state) => ({
      guests: state.guests.filter((g) => g.id !== id),
    }));
  },
  inviteGuest: async (id, channel) => {
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
