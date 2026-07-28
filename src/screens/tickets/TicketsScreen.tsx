import { FlatList, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { AnimatedPressable } from '@/components/shared/AnimatedPressable';
import { useTicketPasses } from '@/features/tickets/hooks';
import { useTheme } from '@/hooks/useTheme';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/format';
import { ROUTES } from '@/constants/routes';
import type { TicketPass, TicketPassStatus } from '@/types';
import type { TicketsStackParamList } from '@/navigation/types';

const toneMap: Record<
  TicketPassStatus,
  'gold' | 'navy' | 'muted' | 'success' | 'danger'
> = {
  valid: 'gold',
  used: 'navy',
  refunded: 'danger',
  expired: 'muted',
  reserved: 'navy',
};

export function TicketsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<TicketsStackParamList>>();
  const issued = useTicketPasses('all').filter((p) => p.source === 'issued');

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
        <Header showBack title="Issued tickets" />
        <Text variant="caption" secondary style={{ marginBottom: 12 }}>
          {issued.length} host-issued passes · tap for QR details
        </Text>
      </View>

      <FlatList
        data={issued}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TicketCard
            ticket={item}
            onPress={() =>
              navigation.navigate(ROUTES.TicketDetails, { ticketId: item.id })
            }
          />
        )}
      />
    </Screen>
  );
}

function TicketCard({
  ticket,
  onPress,
}: {
  ticket: TicketPass;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <AnimatedPressable
      haptic
      onPress={onPress}
      style={{
        marginBottom: 12,
        borderRadius: radius['2xl'],
        backgroundColor: theme.card,
        padding: 16,
        borderWidth: theme.mode === 'dark' ? 1 : 0,
        borderColor: theme.border,
        ...elevation('md', theme.mode),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 10,
        }}
      >
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text variant="h3" style={{ fontSize: 15 }}>
            {ticket.eventTitle}
          </Text>
          <Text variant="caption" muted style={{ marginTop: 4 }}>
            {ticket.guestName} · {ticket.type}
          </Text>
        </View>
        <Badge label={ticket.status} tone={toneMap[ticket.status]} />
      </View>

      <View
        style={{
          marginTop: 4,
          borderRadius: radius.lg,
          backgroundColor: theme.surface,
          paddingVertical: 12,
          paddingHorizontal: 14,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View>
          <Text variant="label">Code</Text>
          <Text
            style={{
              marginTop: 4,
              fontFamily: 'DMSans_700Bold',
              fontSize: 16,
              color: colors.gold[600],
              letterSpacing: 1,
            }}
          >
            {ticket.code}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={{
              fontFamily: 'DMSans_700Bold',
              fontSize: 16,
              color: theme.text,
            }}
          >
            {formatCurrency(ticket.price)}
          </Text>
          <Text variant="caption" muted style={{ marginTop: 2 }}>
            {formatDate(ticket.purchasedAt)}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}
