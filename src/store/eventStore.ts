import { create } from 'zustand';
import { eventsApi } from '@/api';
import { isMockMode } from '@/constants/mockAuth';
import type { EventItem, EventStatus } from '@/types';
import { useMarketplaceStore } from '@/store/marketplaceStore';

export type EventDraft = {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  budget?: number;
  category?: string;
  coverImage?: string;
  status?: EventStatus;
};

type EventState = {
  events: EventItem[];
  loading: boolean;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  fetchEvents: () => Promise<void>;
  createEvent: (draft: EventDraft) => Promise<EventItem>;
  updateEvent: (id: string, patch: Partial<EventItem>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEvent: (id: string) => EventItem | undefined;
  listEvents: () => EventItem[];
};

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000&q=80';

function normalizeEvent(e: EventItem): EventItem {
  return {
    ...e,
    date: typeof e.date === 'string' ? e.date.slice(0, 10) : String(e.date),
    coverImage: e.coverImage || DEFAULT_COVER,
  };
}

function syncTicketListings(events: EventItem[]) {
  useMarketplaceStore.getState().syncFromEvents(events);
}

function localEventFromDraft(draft: EventDraft): EventItem {
  return normalizeEvent({
    id: `evt-mock-${Date.now()}`,
    title: draft.title,
    description: draft.description || '',
    date: draft.date,
    time: draft.time || '18:00',
    location: draft.location || '',
    coverImage: draft.coverImage || DEFAULT_COVER,
    status: draft.status || 'upcoming',
    guestCount: 0,
    ticketSold: 0,
    capacity: draft.capacity || 100,
    budget: draft.budget || 0,
    revenue: 0,
    category: draft.category || 'General',
  });
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  loading: false,
  hydrated: false,
  setHydrated: (v) => set({ hydrated: v }),
  fetchEvents: async () => {
    if (isMockMode) {
      set({ hydrated: true, loading: false });
      syncTicketListings(get().events);
      return;
    }
    set({ loading: true });
    try {
      const { events } = await eventsApi.list();
      const normalized = events.map(normalizeEvent);
      set({
        events: normalized,
        hydrated: true,
        loading: false,
      });
      syncTicketListings(normalized);
    } catch (e) {
      set({ loading: false, hydrated: true });
      throw e;
    }
  },
  createEvent: async (draft) => {
    if (isMockMode) {
      const normalized = localEventFromDraft(draft);
      set((state) => {
        const events = [normalized, ...state.events];
        syncTicketListings(events);
        return { events };
      });
      return normalized;
    }
    const { event } = await eventsApi.create({
      ...draft,
      coverImage: draft.coverImage ?? DEFAULT_COVER,
    });
    const normalized = normalizeEvent(event);
    set((state) => {
      const events = [normalized, ...state.events];
      syncTicketListings(events);
      return { events };
    });
    return normalized;
  },
  updateEvent: async (id, patch) => {
    if (isMockMode) {
      set((state) => {
        const events = state.events.map((e) =>
          e.id === id ? normalizeEvent({ ...e, ...patch, id: e.id }) : e,
        );
        syncTicketListings(events);
        return { events };
      });
      return;
    }
    const { event } = await eventsApi.update(id, patch);
    const normalized = normalizeEvent(event);
    set((state) => {
      const events = state.events.map((e) => (e.id === id ? normalized : e));
      syncTicketListings(events);
      return { events };
    });
  },
  deleteEvent: async (id) => {
    if (isMockMode) {
      set((state) => {
        const events = state.events.filter((e) => e.id !== id);
        syncTicketListings(events);
        return { events };
      });
      return;
    }
    await eventsApi.remove(id);
    set((state) => {
      const events = state.events.filter((e) => e.id !== id);
      syncTicketListings(events);
      return { events };
    });
  },
  getEvent: (id) => get().events.find((e) => e.id === id),
  listEvents: () => get().events,
}));
