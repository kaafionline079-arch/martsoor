import { useCallback, useMemo, useState } from 'react';
import { FlatList, View, type ListRenderItem } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/shared/SearchBar';
import { MarketplaceListingCard } from '@/components/marketplace/MarketplaceListingCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import {
  defaultMarketplaceFilters,
  useMarketplaceListings,
  type MarketplaceFilters,
} from '@/features/marketplace/hooks';
import { useMarketplaceStore } from '@/store/marketplaceStore';
import { colors } from '@/theme/colors';
import { radius } from '@/theme';
import { ROUTES } from '@/constants/routes';
import type { MarketplaceListing, TicketPricingMode } from '@/types';
import type { TicketsStackParamList } from '@/navigation/types';

const PRICING: Array<TicketPricingMode | 'all'> = ['all', 'free', 'paid'];

export function MarketplaceScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<TicketsStackParamList>>();
  const [filters, setFilters] = useState<MarketplaceFilters>(
    defaultMarketplaceFilters,
  );
  const listings = useMarketplaceListings(filters);
  const hydrated = useMarketplaceStore((s) => s.hydrated);

  const setFilter = useCallback(
    <K extends keyof MarketplaceFilters>(key: K, value: MarketplaceFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const renderItem: ListRenderItem<MarketplaceListing> = useCallback(
    ({ item }) => (
      <MarketplaceListingCard
        listing={item}
        onPress={() =>
          navigation.navigate(ROUTES.MarketplaceEvent, { listingId: item.id })
        }
      />
    ),
    [navigation],
  );

  const header = useMemo(
    () => (
      <View>
        <View
          style={{
            marginBottom: 16,
            borderRadius: radius['3xl'],
            backgroundColor: colors.navy[900],
            paddingHorizontal: 18,
            paddingVertical: 20,
          }}
        >
          <Text
            style={{
              fontFamily: 'Fraunces_600SemiBold',
              fontSize: 24,
              color: colors.white,
            }}
          >
            Tickets
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontFamily: 'DMSans_400Regular',
              fontSize: 14,
              color: 'rgba(255,255,255,0.72)',
              lineHeight: 20,
            }}
          >
            Events-kaaga dhabta ah oo Free/Paid ah. Wedding halkan kuma jiro.
          </Text>
          <Button
            title="My virtual cards"
            size="sm"
            variant="secondary"
            style={{ marginTop: 14, alignSelf: 'flex-start' }}
            onPress={() => navigation.navigate(ROUTES.TicketWallet)}
          />
        </View>

        <SearchBar
          value={filters.query}
          onChangeText={(q) => setFilter('query', q)}
          onClear={() => setFilter('query', '')}
          placeholder="Raadi event…"
          style={{ marginBottom: 12 }}
        />

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {PRICING.map((item) => {
            const active = filters.pricing === item;
            return (
              <Button
                key={item}
                title={item === 'all' ? 'All' : item === 'free' ? 'Free' : 'Paid'}
                size="sm"
                variant={active ? 'primary' : 'outline'}
                onPress={() => setFilter('pricing', item)}
              />
            );
          })}
        </View>
      </View>
    ),
    [filters.query, filters.pricing, navigation, setFilter],
  );

  if (!hydrated) {
    return (
      <Screen padded={false}>
        <ListSkeleton />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        ListEmptyComponent={
          <EmptyState
            title="Events ma jiraan"
            description="Abuur event aan Wedding ahayn si tickets loo iibiyo."
          />
        }
      />
    </Screen>
  );
}
