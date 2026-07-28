import { useMemo } from 'react';
import { useMarketplaceStore } from '@/store/marketplaceStore';
import type {
  MarketplaceListing,
  TicketPricingMode,
  TicketTierId,
} from '@/types';

export type MarketplaceFilters = {
  query: string;
  pricing: TicketPricingMode | 'all';
  tier: TicketTierId | 'all';
  availability: 'all' | 'available' | 'sold_out';
};

export const defaultMarketplaceFilters: MarketplaceFilters = {
  query: '',
  pricing: 'all',
  tier: 'all',
  availability: 'all',
};

export function useMarketplaceListings(
  filters: MarketplaceFilters = defaultMarketplaceFilters,
) {
  const listings = useMarketplaceStore((s) => s.listings);

  return useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return listings
      .filter((listing) => {
        if (filters.availability === 'available' && listing.remainingTickets <= 0)
          return false;
        if (filters.availability === 'sold_out' && listing.remainingTickets > 0)
          return false;
        if (filters.pricing === 'free') {
          if (!listing.tiers.some((t) => t.pricingMode === 'free' || t.price === 0))
            return false;
        }
        if (filters.pricing === 'paid') {
          if (!listing.tiers.some((t) => t.price > 0)) return false;
        }
        if (filters.tier !== 'all') {
          const tier = listing.tiers.find((t) => t.id === filters.tier);
          if (!tier || tier.remaining <= 0) return false;
        }
        if (!q) return true;
        return (
          listing.title.toLowerCase().includes(q) ||
          listing.location.toLowerCase().includes(q) ||
          listing.organizer.toLowerCase().includes(q) ||
          listing.category.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return b.date.localeCompare(a.date);
      });
  }, [filters, listings]);
}

export function useMarketplaceListing(listingId: string) {
  return useMarketplaceStore((s) =>
    s.listings.find((l) => l.id === listingId),
  );
}

export function useMarketplaceOrders() {
  return useMarketplaceStore((s) => s.orders);
}

export function listingHasFreeTier(listing: MarketplaceListing) {
  return listing.tiers.some((t) => t.pricingMode === 'free' || t.price === 0);
}

export function formatTierPrice(price: number) {
  if (price <= 0) return 'Free';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(price);
}
