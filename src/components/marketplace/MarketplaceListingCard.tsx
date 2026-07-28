import { memo } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { AnimatedPressable } from '@/components/shared/AnimatedPressable';
import {
  formatTierPrice,
  listingHasFreeTier,
} from '@/features/marketplace/hooks';
import { useTheme } from '@/hooks/useTheme';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';
import type { MarketplaceListing } from '@/types';

type Props = {
  listing: MarketplaceListing;
  onPress: () => void;
};

export const MarketplaceListingCard = memo(function MarketplaceListingCard({
  listing,
  onPress,
}: Props) {
  const theme = useTheme();
  const soldOut = listing.remainingTickets <= 0;
  const hasFree = listingHasFreeTier(listing);

  return (
    <AnimatedPressable
      haptic
      onPress={onPress}
      style={{
        marginBottom: 16,
        borderRadius: radius['3xl'],
        backgroundColor: theme.card,
        overflow: 'hidden',
        borderWidth: theme.mode === 'dark' ? 1 : 0,
        borderColor: theme.border,
        ...elevation('md', theme.mode),
      }}
    >
      <View style={{ height: 188 }}>
        <Image
          source={{ uri: listing.coverImage }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          recyclingKey={listing.id}
          transition={220}
        />
        <LinearGradient
          colors={['transparent', 'rgba(17,21,45,0.72)']}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 100,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Badge
            label={hasFree ? 'Free seats' : 'Paid'}
            tone={hasFree ? 'success' : 'gold'}
          />
          {soldOut ? <Badge label="Sold out" tone="danger" /> : null}
        </View>
        <View style={{ position: 'absolute', left: 14, right: 14, bottom: 12 }}>
          <Text
            style={{
              fontFamily: 'Fraunces_600SemiBold',
              fontSize: 20,
              color: colors.white,
              letterSpacing: -0.3,
            }}
            numberOfLines={2}
          >
            {listing.title}
          </Text>
        </View>
      </View>

      <View style={{ padding: 14 }}>
        <Text variant="caption" muted>
          {listing.date} · {listing.time}
        </Text>
        <Text variant="caption" secondary style={{ marginTop: 4 }} numberOfLines={1}>
          {listing.location}
        </Text>

        <View
          style={{
            marginTop: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Avatar
              uri={listing.organizerAvatar}
              name={listing.organizer}
              size={28}
            />
            <Text
              variant="caption"
              style={{ marginLeft: 8, flex: 1 }}
              numberOfLines={1}
            >
              {listing.organizer}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text
              style={{
                fontFamily: 'DMSans_700Bold',
                fontSize: 15,
                color: colors.gold[600],
              }}
            >
              {soldOut
                ? '—'
                : listing.startingPrice === 0
                  ? 'Free'
                  : `from ${formatTierPrice(listing.startingPrice)}`}
            </Text>
            <Text variant="caption" muted style={{ marginTop: 2 }}>
              {listing.remainingTickets} left
            </Text>
          </View>
        </View>

        <View
          style={{
            marginTop: 12,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 6,
          }}
        >
          {listing.tiers.map((tier) => (
            <View
              key={tier.id}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: radius.md,
                backgroundColor:
                  theme.mode === 'dark' ? colors.navy[800] : colors.gold[50],
              }}
            >
              <Text
                style={{
                  fontFamily: 'DMSans_500Medium',
                  fontSize: 11,
                  color: theme.textSecondary,
                }}
              >
                {tier.name}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </AnimatedPressable>
  );
});
