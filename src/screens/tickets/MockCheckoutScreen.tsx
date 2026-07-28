import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AnimatedPressable } from '@/components/shared/AnimatedPressable';
import {
  formatTierPrice,
  useMarketplaceListing,
} from '@/features/marketplace/hooks';
import { useMarketplaceStore } from '@/store/marketplaceStore';
import { useTicketPassStore } from '@/store/ticketPassStore';
import { useWalletStore } from '@/store/walletStore';
import { useAuthStore } from '@/store';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/useTheme';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/currency';
import { ROUTES } from '@/constants/routes';
import type { TicketsStackParamList } from '@/navigation/types';

const schema = z.object({
  buyerName: z.string().min(2, 'Name is required'),
  buyerEmail: z.string().email('Enter a valid email'),
  quantity: z.number().min(1).max(8),
});

type FormValues = z.infer<typeof schema>;

export function MockCheckoutScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<TicketsStackParamList>>();
  const route = useRoute<RouteProp<TicketsStackParamList, 'MockCheckout'>>();
  const theme = useTheme();
  const { t } = useI18n();
  const { listingId, tierId, mode } = route.params;
  const listing = useMarketplaceListing(listingId);
  const placeOrder = useMarketplaceStore((s) => s.placeOrder);
  const addFromMarketplace = useTicketPassStore((s) => s.addFromMarketplace);
  const purchaseTicket = useWalletStore((s) => s.purchaseTicket);
  const wallet = useWalletStore((s) => s.wallet);
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);

  const tier = listing?.tiers.find((t) => t.id === tierId);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      buyerName: user?.name ?? '',
      buyerEmail: user?.email ?? '',
      quantity: 1,
    },
  });

  const quantity = watch('quantity');

  if (!listing || !tier) {
    return (
      <Screen>
        <Header showBack title="Checkout" />
        <Text>Checkout unavailable</Text>
      </Screen>
    );
  }

  const unitPrice = tier.price;
  const total = unitPrice * quantity;
  const isReserve = mode === 'reserve';
  const isFree = unitPrice <= 0 && !isReserve;
  const maxQty = Math.min(8, tier.remaining);
  const canAfford = total <= wallet.available;

  const onSubmit = handleSubmit(async (values) => {
    if (values.quantity > tier.remaining) {
      Alert.alert('Tickets', 'Tirada ticket-yada kama jiraan. Yaree quantity.');
      return;
    }

    setLoading(true);
    try {
      if (!isReserve && total > 0) {
        const pay = await purchaseTicket({
          amount: total,
          eventTitle: listing.title,
        });
        if (!pay.ok) {
          Alert.alert(t('error'), pay.message || t('insufficientBalance'));
          return;
        }
      } else if (!isReserve && total <= 0) {
        await purchaseTicket({
          amount: 0,
          eventTitle: listing.title,
        });
      }

      const order = placeOrder({
        listingId: listing.id,
        tierId: tier.id,
        quantity: values.quantity,
        mode,
        buyerName: values.buyerName,
        buyerEmail: values.buyerEmail,
      });

      if (!order) {
        if (!isReserve && total > 0) {
          await useWalletStore.getState().fetchWallet();
        }
        Alert.alert(t('error'), 'Tickets may no longer be available.');
        return;
      }

      const pass = addFromMarketplace({
        orderId: order.id,
        code: order.code,
        eventId: order.eventId,
        eventTitle: order.eventTitle,
        coverImage: order.coverImage || listing.coverImage,
        guestName: order.buyerName,
        type: order.tierName,
        price: order.unitPrice,
        status: order.status === 'reserved' ? 'reserved' : 'valid',
        eventDate: listing.date,
        eventTime: listing.time,
        eventLocation: listing.location,
        pricingMode: order.unitPrice > 0 ? 'paid' : 'free',
      });

      // Always open the virtual ticket card after buy / free claim
      if (!isReserve) {
        navigation.replace(ROUTES.TicketDetails, { ticketId: pass.id });
        return;
      }

      Alert.alert('Seat reserved', `Code ${order.code}`, [
        {
          text: 'Open card',
          onPress: () =>
            navigation.navigate(ROUTES.TicketDetails, { ticketId: pass.id }),
        },
        {
          text: 'My tickets',
          onPress: () => navigation.navigate(ROUTES.TicketWallet),
        },
      ]);
    } catch (e) {
      Alert.alert(
        t('error'),
        e instanceof Error ? e.message : 'Checkout failed',
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <Screen scroll>
      <Header
        showBack
        title={isReserve ? 'Reserve' : isFree ? 'Free ticket' : 'Buy ticket'}
      />

      <View
        style={{
          borderRadius: radius['3xl'],
          backgroundColor: colors.navy[900],
          padding: 18,
          marginBottom: 20,
          ...elevation('md', theme.mode),
        }}
      >
        <Text
          style={{
            fontFamily: 'Fraunces_600SemiBold',
            fontSize: 12,
            color: colors.gold[300],
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          {isFree ? 'Free event card' : 'Wallet checkout'}
        </Text>
        <Text
          style={{
            fontFamily: 'Fraunces_600SemiBold',
            fontSize: 22,
            color: colors.white,
          }}
        >
          {listing.title}
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontFamily: 'DMSans_400Regular',
            fontSize: 13,
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          {tier.name} · {listing.date} · {listing.time} · {listing.location}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
          <Badge label={isReserve ? 'Reserve' : isFree ? 'Free' : 'Paid'} tone="gold" />
          <Badge
            label={unitPrice === 0 ? 'Free' : 'Paid'}
            tone={unitPrice === 0 ? 'success' : 'navy'}
          />
        </View>
      </View>

      {isFree ? (
        <View
          style={{
            borderRadius: radius['2xl'],
            backgroundColor: theme.card,
            padding: 16,
            marginBottom: 20,
            borderWidth: theme.mode === 'dark' ? 1 : 0,
            borderColor: theme.border,
            ...elevation('sm', theme.mode),
          }}
        >
          <Text variant="h3" style={{ marginBottom: 10 }}>
            Event details
          </Text>
          <Row label="Event" value={listing.title} />
          <Row label="Date" value={`${listing.date} · ${listing.time}`} />
          <Row label="Location" value={listing.location} />
          <Row label="Tier" value={tier.name} last />
          <Text variant="caption" muted style={{ marginTop: 12 }}>
            Ticket-kan waa bilaash. Card ayaa kuu diyaarin doona faahfaahinta event-ka.
          </Text>
        </View>
      ) : null}

      <Controller
        control={control}
        name="buyerName"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Full name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.buyerName?.message}
            containerStyle={{ marginBottom: 14 }}
          />
        )}
      />
      <Controller
        control={control}
        name="buyerEmail"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.buyerEmail?.message}
            containerStyle={{ marginBottom: 18 }}
          />
        )}
      />

      <Text variant="caption" muted style={{ marginBottom: 8 }}>
        Quantity
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <QtyButton
          label="−"
          onPress={() => setValue('quantity', Math.max(1, quantity - 1))}
        />
        <Text variant="h2">{quantity}</Text>
        <QtyButton
          label="+"
          onPress={() =>
            setValue('quantity', Math.min(maxQty, quantity + 1))
          }
        />
        <Text variant="caption" muted style={{ marginLeft: 8 }}>
          max {maxQty}
        </Text>
      </View>

      <View
        style={{
          borderRadius: radius['2xl'],
          backgroundColor: theme.card,
          padding: 16,
          marginBottom: 24,
          borderWidth: theme.mode === 'dark' ? 1 : 0,
          borderColor: theme.border,
          ...elevation('sm', theme.mode),
        }}
      >
        <Row label="Unit" value={formatTierPrice(unitPrice)} />
        <Row label="Qty" value={`× ${quantity}`} />
        <Row label="Total" value={formatTierPrice(total)} bold last />
        {!isFree && !isReserve ? (
          <>
            <Row
              label="Wallet balance"
              value={formatCurrency(wallet.available)}
            />
            <Text variant="caption" muted style={{ marginTop: 10 }}>
              Lacagta waxaa laga jari doonaa balance-kaaga. Haddii ay fashilanto, waa laguu soo celinayaa.
            </Text>
            {!canAfford ? (
              <Text
                variant="caption"
                style={{ marginTop: 8, color: theme.danger }}
              >
                {t('insufficientBalance')}
              </Text>
            ) : null}
          </>
        ) : (
          <Text variant="caption" muted style={{ marginTop: 10 }}>
            {isReserve
              ? 'Reservation holds seats. No charge.'
              : 'Free ticket — no payment required.'}
          </Text>
        )}
      </View>

      <Button
        title={
          isReserve
            ? 'Confirm reservation'
            : isFree
              ? 'Get free ticket card'
              : 'Pay from wallet'
        }
        fullWidth
        size="lg"
        loading={loading}
        disabled={!isReserve && !isFree && !canAfford}
        onPress={onSubmit}
      />
    </Screen>
  );
}

function Row({
  label,
  value,
  bold = false,
  last = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
  last?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.border,
      }}
    >
      <Text variant="caption" muted>
        {label}
      </Text>
      <Text
        style={{
          fontFamily: bold ? 'DMSans_700Bold' : 'DMSans_500Medium',
          fontSize: bold ? 18 : 14,
          color: bold ? colors.gold[600] : theme.text,
          maxWidth: '65%',
          textAlign: 'right',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function QtyButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <AnimatedPressable
      haptic
      onPress={onPress}
      style={{
        width: 44,
        height: 44,
        borderRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      <Text variant="h3">{label}</Text>
    </AnimatedPressable>
  );
}
