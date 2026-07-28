import { View } from 'react-native';
import { Image } from 'expo-image';
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
import { FakeQrCode } from '@/components/tickets/FakeQrCode';
import {
  ticketStatusTone,
  useTicketHistory,
  useTicketPass,
} from '@/features/tickets/hooks';
import { useTheme } from '@/hooks/useTheme';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/format';
import { ROUTES } from '@/constants/routes';
import type { TicketsStackParamList } from '@/navigation/types';

/** Virtual ticket card — for Free & Paid (non-wedding) events only */
export function TicketDetailsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<TicketsStackParamList>>();
  const route = useRoute<RouteProp<TicketsStackParamList, 'TicketDetails'>>();
  const theme = useTheme();
  const ticket = useTicketPass(route.params.ticketId);
  const history = useTicketHistory(route.params.ticketId).slice(0, 4);

  if (!ticket) {
    return (
      <Screen>
        <Header showBack title="Virtual ticket" />
        <Text>Ticket not found</Text>
      </Screen>
    );
  }

  const used = ticket.status === 'used';
  const isFree = ticket.pricingMode === 'free' || ticket.price <= 0;
  const when = [ticket.eventDate, ticket.eventTime].filter(Boolean).join(' · ');

  return (
    <Screen scroll>
      <Header showBack title="Virtual ticket card" />
      <Text variant="caption" secondary style={{ marginBottom: 14 }}>
        Ticket card — Free ama Paid. Ma aha invitation.
      </Text>

      {/* Virtual card */}
      <View
        style={{
          borderRadius: radius['3xl'],
          overflow: 'hidden',
          marginBottom: 20,
          ...elevation('lg', theme.mode),
        }}
      >
        {ticket.coverImage ? (
          <Image
            source={{ uri: ticket.coverImage }}
            style={{ width: '100%', height: 120 }}
            contentFit="cover"
          />
        ) : null}

        <View
          style={{
            backgroundColor: colors.navy[900],
            paddingHorizontal: 20,
            paddingTop: 18,
            paddingBottom: 8,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                fontFamily: 'Fraunces_600SemiBold',
                fontSize: 11,
                color: colors.gold[300],
                letterSpacing: 1.4,
                textTransform: 'uppercase',
              }}
            >
              Martisoor · Virtual card
            </Text>
            <Badge
              label={isFree ? 'FREE' : 'PAID'}
              tone={isFree ? 'success' : 'gold'}
            />
          </View>

          <Text
            style={{
              fontFamily: 'Fraunces_600SemiBold',
              fontSize: 24,
              color: colors.white,
              marginBottom: 6,
            }}
          >
            {ticket.eventTitle}
          </Text>
          <Text
            style={{
              fontFamily: 'DMSans_400Regular',
              fontSize: 13,
              color: 'rgba(255,255,255,0.75)',
              marginBottom: 14,
            }}
          >
            {ticket.guestName} · {ticket.type}
          </Text>

          <CardMeta label="Date & time" value={when || '—'} />
          <CardMeta
            label="Location"
            value={ticket.eventLocation || '—'}
          />
          <CardMeta
            label="Price"
            value={isFree ? 'Free' : formatCurrency(ticket.price)}
            last
          />
        </View>

        {/* Tear line */}
        <View
          style={{
            height: 18,
            backgroundColor: colors.navy[900],
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 0,
          }}
        >
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: theme.background,
              marginLeft: -9,
            }}
          />
          <View
            style={{
              flex: 1,
              borderStyle: 'dashed',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.25)',
              marginHorizontal: 8,
            }}
          />
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: theme.background,
              marginRight: -9,
            }}
          />
        </View>

        <View
          style={{
            backgroundColor: colors.navy[900],
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 22,
            alignItems: 'center',
          }}
        >
          <FakeQrCode value={ticket.qrPayload} size={160} faded={used} />
          <Text
            style={{
              marginTop: 14,
              fontFamily: 'DMSans_700Bold',
              fontSize: 20,
              letterSpacing: 3,
              color: colors.gold[300],
            }}
          >
            {ticket.code}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <Badge label={ticket.status} tone={ticketStatusTone(ticket.status)} />
            <Badge
              label={ticket.source === 'marketplace' ? 'Bought' : 'Issued'}
              tone="navy"
            />
          </View>
        </View>
      </View>

      <Detail label="Purchased" value={formatDate(ticket.purchasedAt)} />
      <Detail
        label="Scanned"
        value={ticket.scannedAt ? formatDate(ticket.scannedAt) : '—'}
      />
      <Detail
        label="Downloaded"
        value={ticket.downloadedAt ? formatDate(ticket.downloadedAt) : 'Never'}
        last
      />

      {history.length ? (
        <View style={{ marginTop: 20, marginBottom: 8 }}>
          <Text variant="bodyMedium" style={{ marginBottom: 10 }}>
            Recent activity
          </Text>
          {history.map((item) => (
            <Text
              key={item.id}
              variant="caption"
              muted
              style={{ marginBottom: 6 }}
            >
              {formatDate(item.at)} · {item.message}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={{ marginTop: 16, gap: 12 }}>
        <Button
          title="Ticket status"
          fullWidth
          variant="secondary"
          onPress={() =>
            navigation.navigate(ROUTES.TicketStatus, { ticketId: ticket.id })
          }
        />
        <Button
          title="Download ticket"
          fullWidth
          onPress={() =>
            navigation.navigate(ROUTES.DownloadTicket, { ticketId: ticket.id })
          }
        />
        <Button
          title="My tickets"
          fullWidth
          variant="outline"
          onPress={() => navigation.navigate(ROUTES.TicketWallet)}
        />
      </View>
    </Screen>
  );
}

function CardMeta({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: 'rgba(255,255,255,0.12)',
      }}
    >
      <Text
        style={{
          fontFamily: 'DMSans_400Regular',
          fontSize: 12,
          color: 'rgba(255,255,255,0.55)',
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: 'DMSans_600SemiBold',
          fontSize: 13,
          color: colors.white,
          maxWidth: '62%',
          textAlign: 'right',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function Detail({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
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
      }}
    >
      <Text variant="caption" muted>
        {label}
      </Text>
      <Text variant="bodyMedium">{value}</Text>
    </View>
  );
}
