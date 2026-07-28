import { FlatList, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  formatTierPrice,
  useMarketplaceOrders,
} from '@/features/marketplace/hooks';
import { useMarketplaceStore } from '@/store/marketplaceStore';
import { useTheme } from '@/hooks/useTheme';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';
import { formatDate } from '@/utils/format';
import { ROUTES } from '@/constants/routes';
import type { MarketplaceOrder, MarketplaceOrderStatus } from '@/types';
import type { TicketsStackParamList } from '@/navigation/types';

const toneMap: Record<
  MarketplaceOrderStatus,
  'gold' | 'navy' | 'muted' | 'success' | 'danger'
> = {
  reserved: 'navy',
  purchased: 'gold',
  cancelled: 'danger',
};

export function MyMarketplaceOrdersScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<TicketsStackParamList>>();
  const orders = useMarketplaceOrders();
  const cancelOrder = useMarketplaceStore((s) => s.cancelOrder);

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: 20 }}>
        <Header showBack title="My orders" />
        <Text variant="caption" secondary style={{ marginBottom: 14 }}>
          Reservations and mock purchases · local only
        </Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 32,
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40, gap: 16 }}>
            <Text variant="body" secondary style={{ textAlign: 'center' }}>
              No marketplace orders yet.
            </Text>
            <Button
              title="Browse marketplace"
              onPress={() => navigation.navigate(ROUTES.TicketsMain)}
            />
          </View>
        }
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onCancel={() => cancelOrder(item.id)}
            onBrowse={() =>
              navigation.navigate(ROUTES.MarketplaceEvent, {
                listingId: item.listingId,
              })
            }
            onOpenTicket={() =>
              navigation.navigate(ROUTES.TicketDetails, {
                ticketId: `pass-${item.id}`,
              })
            }
          />
        )}
      />
    </Screen>
  );
}

function OrderCard({
  order,
  onCancel,
  onBrowse,
  onOpenTicket,
}: {
  order: MarketplaceOrder;
  onCancel: () => void;
  onBrowse: () => void;
  onOpenTicket: () => void;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        marginBottom: 14,
        borderRadius: radius['2xl'],
        backgroundColor: theme.card,
        overflow: 'hidden',
        borderWidth: theme.mode === 'dark' ? 1 : 0,
        borderColor: theme.border,
        ...elevation('md', theme.mode),
      }}
    >
      <Image
        source={{ uri: order.coverImage }}
        style={{ width: '100%', height: 110 }}
        contentFit="cover"
      />
      <View style={{ padding: 14 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 8,
          }}
        >
          <Text variant="bodyMedium" style={{ flex: 1, paddingRight: 8 }}>
            {order.eventTitle}
          </Text>
          <Badge label={order.status} tone={toneMap[order.status]} />
        </View>
        <Text variant="caption" muted>
          {order.tierName} · ×{order.quantity} · {formatTierPrice(order.total)}
        </Text>
        <Text
          style={{
            marginTop: 10,
            fontFamily: 'DMSans_700Bold',
            fontSize: 15,
            color: colors.gold[600],
            letterSpacing: 1,
          }}
        >
          {order.code}
        </Text>
        <Text variant="caption" muted style={{ marginTop: 4 }}>
          {order.buyerName} · {formatDate(order.createdAt)}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
          <Button title="Ticket" size="sm" onPress={onOpenTicket} />
          <Button title="Event" size="sm" variant="outline" onPress={onBrowse} />
          {order.status !== 'cancelled' ? (
            <Button
              title="Cancel"
              size="sm"
              variant="ghost"
              onPress={onCancel}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}
