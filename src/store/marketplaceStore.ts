import { create } from 'zustand';
import type {
  MarketplaceListing,
  MarketplaceOrder,
  MarketplaceOrderStatus,
  TicketTierId,
  EventItem,
} from '@/types';
import { getCategoryOption } from '@/features/events/categories';

type PlaceOrderInput = {
  listingId: string;
  tierId: TicketTierId;
  quantity: number;
  mode?: 'reserve' | 'buy';
  buyerName: string;
  buyerEmail: string;
  status?: MarketplaceOrderStatus;
};

type MarketplaceState = {
  listings: MarketplaceListing[];
  orders: MarketplaceOrder[];
  hydrated: boolean;
  hydrate: () => void;
  syncFromEvents: (events: EventItem[]) => void;
  placeOrder: (input: PlaceOrderInput) => MarketplaceOrder | null;
  cancelOrder: (id: string) => void;
};

function eventToListing(event: EventItem): MarketplaceListing {
  const remaining = Math.max(0, event.capacity - (event.ticketSold || 0));
  const isFree = (event.budget || 0) <= 0;
  const price = isFree
    ? 0
    : Math.max(10, Math.round(Number(event.budget) / Math.max(1, event.capacity)));
  return {
    id: `evt-listing-${event.id}`,
    eventId: event.id,
    title: event.title,
    description: event.description || 'Event ticket from Martisoor',
    coverImage:
      event.coverImage ||
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&q=80',
    location: event.location,
    date: event.date,
    time: event.time || '18:00',
    organizer: 'Martisoor',
    organizerAvatar: '',
    category: event.category || 'General',
    status:
      event.status === 'cancelled'
        ? 'draft'
        : event.status === 'completed'
          ? 'completed'
          : 'live',
    startingPrice: price,
    remainingTickets: remaining,
    featured: true,
    tiers: [
      {
        id: 'regular',
        name: 'Regular',
        pricingMode: isFree ? 'free' : 'paid',
        price,
        capacity: event.capacity,
        remaining,
        description: isFree ? 'Free ticket card' : 'Paid ticket',
      },
      {
        id: 'vip',
        name: 'VIP',
        pricingMode: 'paid',
        price: isFree ? 25 : price * 2,
        capacity: Math.max(5, Math.floor(event.capacity * 0.15)),
        remaining: Math.max(0, Math.floor(remaining * 0.15)),
        description: 'VIP',
      },
    ],
  };
}

/** Real Neon events only — no fake seed listings */
export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  listings: [],
  orders: [],
  hydrated: true,
  hydrate: () => set({ listings: [], hydrated: true }),
  syncFromEvents: (events) => {
    const ticketEvents = events.filter((e) => {
      const cat = getCategoryOption(e.category);
      return cat?.id !== 'wedding' && e.status !== 'cancelled';
    });
    set({ listings: ticketEvents.map(eventToListing), hydrated: true });
  },
  placeOrder: (input) => {
    const listing = get().listings.find((l) => l.id === input.listingId);
    const tier = listing?.tiers.find((t) => t.id === input.tierId);
    if (!listing || !tier) return null;
    if (tier.remaining < input.quantity) return null;

    const code = `MT-${Date.now().toString().slice(-6)}`;
    const order: MarketplaceOrder = {
      id: `ord-${Date.now()}`,
      listingId: listing.id,
      eventId: listing.eventId,
      eventTitle: listing.title,
      coverImage: listing.coverImage,
      tierId: tier.id,
      tierName: tier.name,
      quantity: input.quantity,
      unitPrice: tier.price,
      total: tier.price * input.quantity,
      pricingMode: tier.pricingMode,
      status:
        input.status ?? (input.mode === 'reserve' ? 'reserved' : 'purchased'),
      buyerName: input.buyerName,
      buyerEmail: input.buyerEmail,
      createdAt: new Date().toISOString(),
      code,
    };

    set((s) => ({
      orders: [order, ...s.orders],
      listings: s.listings.map((l) => {
        if (l.id !== listing.id) return l;
        return {
          ...l,
          remainingTickets: Math.max(0, l.remainingTickets - input.quantity),
          tiers: l.tiers.map((t) =>
            t.id === tier.id
              ? { ...t, remaining: Math.max(0, t.remaining - input.quantity) }
              : t,
          ),
        };
      }),
    }));
    return order;
  },
  cancelOrder: (id) => {
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, status: 'cancelled' } : o,
      ),
    }));
  },
}));
