import { FlatList, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { useTicketHistory, useTicketPass } from '@/features/tickets/hooks';
import { useTheme } from '@/hooks/useTheme';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';
import { formatDate } from '@/utils/format';
import type { TicketHistoryEvent, TicketHistoryKind } from '@/types';
import type { TicketsStackParamList } from '@/navigation/types';

const kindTone: Record<
  TicketHistoryKind,
  'gold' | 'navy' | 'muted' | 'success' | 'danger'
> = {
  issued: 'navy',
  purchased: 'gold',
  downloaded: 'gold',
  scanned: 'navy',
  checked_in: 'success',
  already_used: 'danger',
  expired: 'muted',
  refunded: 'danger',
  status_changed: 'muted',
};

export function TicketHistoryScreen() {
  const route = useRoute<RouteProp<TicketsStackParamList, 'TicketHistory'>>();
  const ticketId = route.params?.ticketId;
  const ticket = useTicketPass(ticketId ?? '');
  const history = useTicketHistory(ticketId);

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: 20 }}>
        <Header
          showBack
          title={ticketId ? 'Ticket history' : 'Ticket history'}
        />
        <Text variant="caption" secondary style={{ marginBottom: 14 }}>
          {ticket
            ? `${ticket.code} · ${ticket.eventTitle}`
            : `${history.length} local events`}
        </Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 32,
        }}
        ListEmptyComponent={
          <Text
            variant="body"
            secondary
            style={{ textAlign: 'center', marginTop: 32 }}
          >
            No history yet.
          </Text>
        }
        renderItem={({ item }) => <HistoryRow event={item} />}
      />
    </Screen>
  );
}

function HistoryRow({ event }: { event: TicketHistoryEvent }) {
  const theme = useTheme();
  return (
    <View
      style={{
        marginBottom: 10,
        borderRadius: radius['2xl'],
        backgroundColor: theme.card,
        padding: 14,
        borderWidth: theme.mode === 'dark' ? 1 : 0,
        borderColor: theme.border,
        borderLeftWidth: 3,
        borderLeftColor: colors.gold[500],
        ...elevation('sm', theme.mode),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <Badge label={event.kind.replace('_', ' ')} tone={kindTone[event.kind]} />
        <Text variant="caption" muted>
          {formatDate(event.at)}
        </Text>
      </View>
      <Text variant="body">{event.message}</Text>
    </View>
  );
}
