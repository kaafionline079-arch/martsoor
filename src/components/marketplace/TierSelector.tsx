import { memo } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { AnimatedPressable } from '@/components/shared/AnimatedPressable';
import { formatTierPrice } from '@/features/marketplace/hooks';
import { useTheme } from '@/hooks/useTheme';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';
import type { MarketplaceTicketTier, TicketTierId } from '@/types';

type Props = {
  tiers: MarketplaceTicketTier[];
  selectedId: TicketTierId;
  onSelect: (id: TicketTierId) => void;
};

export const TierSelector = memo(function TierSelector({
  tiers,
  selectedId,
  onSelect,
}: Props) {
  const theme = useTheme();

  return (
    <View style={{ gap: 10 }}>
      {tiers.map((tier) => {
        const selected = tier.id === selectedId;
        const soldOut = tier.remaining <= 0;
        return (
          <AnimatedPressable
            key={tier.id}
            haptic
            disabled={soldOut}
            onPress={() => onSelect(tier.id)}
            style={{
              borderRadius: radius['2xl'],
              padding: 14,
              backgroundColor: selected
                ? theme.mode === 'dark'
                  ? colors.navy[800]
                  : colors.gold[50]
                : theme.card,
              borderWidth: 1.5,
              borderColor: selected
                ? colors.gold[500]
                : theme.border,
              opacity: soldOut ? 0.45 : 1,
              ...elevation(selected ? 'sm' : 'none', theme.mode),
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <Text variant="bodyMedium">{tier.name}</Text>
                  <Badge
                    label={tier.price === 0 ? 'Free' : 'Paid'}
                    tone={tier.price === 0 ? 'success' : 'gold'}
                  />
                </View>
                <Text variant="caption" muted>
                  {tier.description}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text
                  style={{
                    fontFamily: 'DMSans_700Bold',
                    fontSize: 16,
                    color: colors.gold[600],
                  }}
                >
                  {formatTierPrice(tier.price)}
                </Text>
                <Text variant="caption" muted style={{ marginTop: 4 }}>
                  {soldOut ? 'Sold out' : `${tier.remaining} left`}
                </Text>
              </View>
            </View>
          </AnimatedPressable>
        );
      })}
    </View>
  );
});
