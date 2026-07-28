import { View } from 'react-native';
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
import { AnimatedPressable } from '@/components/shared/AnimatedPressable';
import {
  ticketStatusTone,
  useTicketPass,
} from '@/features/tickets/hooks';
import { useTicketPassStore } from '@/store/ticketPassStore';
import { useTheme } from '@/hooks/useTheme';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';
import { ROUTES } from '@/constants/routes';
import type { TicketPassStatus } from '@/types';
import type { TicketsStackParamList } from '@/navigation/types';

const STATUSES: TicketPassStatus[] = [
  'valid',
  'used',
  'reserved',
  'expired',
  'refunded',
];

export function TicketStatusScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<TicketsStackParamList>>();
  const route = useRoute<RouteProp<TicketsStackParamList, 'TicketStatus'>>();
  const theme = useTheme();
  const ticket = useTicketPass(route.params.ticketId);
  const setStatus = useTicketPassStore((s) => s.setStatus);

  if (!ticket) {
    return (
      <Screen>
        <Header showBack title="Status" />
        <Text>Ticket not found</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Header showBack title="Ticket status" />
      <Text variant="caption" secondary style={{ marginBottom: 18 }}>
        Local status only — changes persist on-device.
      </Text>

      <View
        style={{
          borderRadius: radius['3xl'],
          backgroundColor: theme.card,
          padding: 20,
          alignItems: 'center',
          marginBottom: 22,
          borderWidth: theme.mode === 'dark' ? 1 : 0,
          borderColor: theme.border,
          ...elevation('md', theme.mode),
        }}
      >
        <Text variant="caption" muted style={{ marginBottom: 8 }}>
          Current
        </Text>
        <Badge
          label={ticket.status}
          tone={ticketStatusTone(ticket.status)}
        />
        <Text
          style={{
            marginTop: 16,
            fontFamily: 'DMSans_700Bold',
            fontSize: 20,
            letterSpacing: 1.5,
            color: colors.gold[600],
          }}
        >
          {ticket.code}
        </Text>
        <Text variant="caption" secondary style={{ marginTop: 8 }}>
          {ticket.eventTitle}
        </Text>
      </View>

      <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
        Set status
      </Text>
      <View style={{ gap: 10, marginBottom: 24 }}>
        {STATUSES.map((status) => {
          const active = ticket.status === status;
          return (
            <AnimatedPressable
              key={status}
              haptic
              onPress={() => setStatus(ticket.id, status)}
              style={{
                padding: 14,
                borderRadius: radius['2xl'],
                backgroundColor: active
                  ? theme.mode === 'dark'
                    ? colors.navy[800]
                    : colors.gold[50]
                  : theme.card,
                borderWidth: 1.5,
                borderColor: active ? colors.gold[500] : theme.border,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'DMSans_600SemiBold',
                  fontSize: 14,
                  color: theme.text,
                  textTransform: 'capitalize',
                }}
              >
                {status.replace('_', ' ')}
              </Text>
              <Badge label={status} tone={ticketStatusTone(status)} />
            </AnimatedPressable>
          );
        })}
      </View>

      <Button
        title="Open ticket details"
        fullWidth
        variant="outline"
        onPress={() =>
          navigation.navigate(ROUTES.TicketDetails, { ticketId: ticket.id })
        }
      />
    </Screen>
  );
}
