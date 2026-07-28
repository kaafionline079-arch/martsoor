import { useState } from 'react';
import { Alert, View } from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FakeQrCode } from '@/components/tickets/FakeQrCode';
import {
  ticketStatusTone,
  useTicketPass,
} from '@/features/tickets/hooks';
import { useTicketPassStore } from '@/store/ticketPassStore';
import { useTheme } from '@/hooks/useTheme';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';
import { formatDate } from '@/utils/format';
import { ROUTES } from '@/constants/routes';
import type { TicketsStackParamList } from '@/navigation/types';

export function DownloadTicketScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<TicketsStackParamList>>();
  const route = useRoute<RouteProp<TicketsStackParamList, 'DownloadTicket'>>();
  const theme = useTheme();
  const ticket = useTicketPass(route.params.ticketId);
  const markDownloaded = useTicketPassStore((s) => s.markDownloaded);
  const [loading, setLoading] = useState(false);

  if (!ticket) {
    return (
      <Screen>
        <Header showBack title="Download" />
        <Text>Ticket not found</Text>
      </Screen>
    );
  }

  const onDownload = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    markDownloaded(ticket.id);
    setLoading(false);
    Alert.alert(
      'Ticket saved',
      'Mock download complete. QR pass stored in local history — no file exported.',
      [
        {
          text: 'View details',
          onPress: () =>
            navigation.navigate(ROUTES.TicketDetails, { ticketId: ticket.id }),
        },
        { text: 'OK' },
      ],
    );
  };

  return (
    <Screen scroll>
      <Header showBack title="Download ticket" />
      <Text variant="caption" secondary style={{ marginBottom: 18 }}>
        Preview your pass, then save a mock copy to local state.
      </Text>

      <View
        style={{
          borderRadius: radius['3xl'],
          backgroundColor: theme.card,
          padding: 20,
          alignItems: 'center',
          borderWidth: theme.mode === 'dark' ? 1 : 0,
          borderColor: theme.border,
          ...elevation('md', theme.mode),
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            fontFamily: 'Fraunces_600SemiBold',
            fontSize: 20,
            color: theme.text,
            textAlign: 'center',
            marginBottom: 6,
          }}
        >
          {ticket.eventTitle}
        </Text>
        <Text variant="caption" muted style={{ marginBottom: 14 }}>
          {ticket.guestName} · {ticket.type}
        </Text>
        <Badge label={ticket.status} tone={ticketStatusTone(ticket.status)} />
        <View style={{ marginVertical: 18 }}>
          <FakeQrCode
            value={ticket.qrPayload}
            size={190}
            faded={ticket.status === 'used'}
          />
        </View>
        <Text
          style={{
            fontFamily: 'DMSans_700Bold',
            fontSize: 16,
            letterSpacing: 2,
            color: colors.gold[600],
          }}
        >
          {ticket.code}
        </Text>
        {ticket.downloadedAt ? (
          <Text variant="caption" muted style={{ marginTop: 10 }}>
            Last saved {formatDate(ticket.downloadedAt)}
          </Text>
        ) : null}
      </View>

      <Button
        title={ticket.downloadedAt ? 'Save again' : 'Download ticket'}
        fullWidth
        size="lg"
        loading={loading}
        onPress={onDownload}
      />
      <Button
        title="Open details"
        fullWidth
        variant="outline"
        style={{ marginTop: 12 }}
        onPress={() =>
          navigation.navigate(ROUTES.TicketDetails, { ticketId: ticket.id })
        }
      />
    </Screen>
  );
}
