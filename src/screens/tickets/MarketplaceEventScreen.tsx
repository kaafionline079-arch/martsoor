import { useMemo, useState } from 'react';
import { View, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { TierSelector } from '@/components/marketplace/TierSelector';
import {
  formatTierPrice,
  useMarketplaceListing,
} from '@/features/marketplace/hooks';
import { useTheme } from '@/hooks/useTheme';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';
import { ROUTES } from '@/constants/routes';
import type { TicketTierId } from '@/types';
import type { TicketsStackParamList } from '@/navigation/types';

const COVER_H = Math.min(Dimensions.get('window').height * 0.42, 360);

export function MarketplaceEventScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<TicketsStackParamList>>();
  const route = useRoute<RouteProp<TicketsStackParamList, 'MarketplaceEvent'>>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const listing = useMarketplaceListing(route.params.listingId);

  const defaultTierId = useMemo((): TicketTierId => {
    return listing?.tiers.find((t) => t.remaining > 0)?.id ?? 'regular';
  }, [listing]);
  const [tierId, setTierId] = useState<TicketTierId | null>(null);
  const activeTierId = tierId ?? defaultTierId;

  if (!listing) {
    return (
      <Screen>
        <Header showBack title="Event" />
        <Text>Listing not found</Text>
      </Screen>
    );
  }

  const selected =
    listing.tiers.find((t) => t.id === activeTierId) ??
    listing.tiers.find((t) => t.remaining > 0) ??
    listing.tiers[0];

  if (!selected) {
    return (
      <Screen>
        <Header showBack title="Event" />
        <Text>No ticket tiers available</Text>
      </Screen>
    );
  }

  const soldOut = listing.remainingTickets <= 0 || selected.remaining <= 0;

  const goCheckout = (mode: 'reserve' | 'buy') => {
    navigation.navigate(ROUTES.MockCheckout, {
      listingId: listing.id,
      tierId: selected.id,
      mode,
    });
  };

  return (
    <Screen padded={false} scroll edges={['bottom']}>
      <View style={{ height: COVER_H }}>
        <Image
          source={{ uri: listing.coverImage }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={250}
        />
        <LinearGradient
          colors={['rgba(17,21,45,0.55)', 'transparent', 'rgba(17,21,45,0.88)']}
          locations={[0, 0.35, 1]}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: insets.top + 4,
            left: 8,
            right: 8,
          }}
        >
          <Header showBack title="" />
        </View>
        <View
          style={{
            position: 'absolute',
            left: 20,
            right: 20,
            bottom: 22,
          }}
        >
          <Text
            style={{
              fontFamily: 'Fraunces_600SemiBold',
              fontSize: 12,
              color: colors.gold[300],
              letterSpacing: 1.4,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Martisoor · {listing.category}
          </Text>
          <Text
            style={{
              fontFamily: 'Fraunces_600SemiBold',
              fontSize: 30,
              color: colors.white,
              letterSpacing: -0.6,
              lineHeight: 36,
            }}
          >
            {listing.title}
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontFamily: 'DMSans_400Regular',
              fontSize: 14,
              color: 'rgba(255,255,255,0.78)',
            }}
            numberOfLines={2}
          >
            {listing.location} · {listing.date}
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36 }}>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 18,
          }}
        >
          <Badge
            label={selected.price === 0 ? 'Free' : 'Paid'}
            tone={selected.price === 0 ? 'success' : 'gold'}
          />
          <Badge label={`${listing.remainingTickets} remaining`} tone="navy" />
          <Badge label={listing.status} tone="muted" />
        </View>

        <MetaRow
          label="Date"
          value={`${listing.date} · ${listing.time}`}
        />
        <MetaRow label="Location" value={listing.location} />
        <MetaRow
          label="Ticket price"
          value={formatTierPrice(selected.price)}
          accent
        />
        <MetaRow
          label="Remaining"
          value={`${selected.remaining} · ${selected.name}`}
          last
        />

        <View
          style={{
            marginTop: 8,
            marginBottom: 22,
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: radius['2xl'],
            backgroundColor: theme.card,
            padding: 14,
            borderWidth: theme.mode === 'dark' ? 1 : 0,
            borderColor: theme.border,
            ...elevation('sm', theme.mode),
          }}
        >
          <Avatar
            uri={listing.organizerAvatar}
            name={listing.organizer}
            size={48}
          />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text variant="caption" muted>
              Organizer
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 2 }}>
              {listing.organizer}
            </Text>
          </View>
        </View>

        <Text variant="h3" style={{ marginBottom: 6 }}>
          Categories
        </Text>
        <Text variant="caption" secondary style={{ marginBottom: 14 }}>
          VIP · Regular · Student · Family — Free or Paid
        </Text>
        <TierSelector
          tiers={listing.tiers}
          selectedId={selected.id}
          onSelect={setTierId}
        />

        <Text
          variant="caption"
          muted
          style={{ marginTop: 18, marginBottom: 14, lineHeight: 18 }}
        >
          {listing.description}
        </Text>

        <View style={{ gap: 12 }}>
          <Button
            title={
              selected.price === 0
                ? 'Claim free → virtual card'
                : 'Buy → virtual card'
            }
            fullWidth
            size="lg"
            disabled={soldOut}
            onPress={() => goCheckout('buy')}
          />
        </View>
      </View>
    </Screen>
  );
}

function MetaRow({
  label,
  value,
  accent = false,
  last = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  last?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        paddingVertical: 12,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Text variant="caption" muted>
        {label}
      </Text>
      <Text
        style={{
          fontFamily: accent ? 'DMSans_700Bold' : 'DMSans_500Medium',
          fontSize: 14,
          color: accent ? colors.gold[600] : theme.text,
          maxWidth: '62%',
          textAlign: 'right',
        }}
      >
        {value}
      </Text>
    </View>
  );
}
