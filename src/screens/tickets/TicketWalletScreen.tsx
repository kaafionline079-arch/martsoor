import { useCallback, useMemo, useState, memo } from 'react';
import { FlatList, ScrollView, View, type ListRenderItem } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AnimatedPressable } from '@/components/shared/AnimatedPressable';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ticketStatusTone,
  useTicketPasses,
} from '@/features/tickets/hooks';
import { useTheme } from '@/hooks/useTheme';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/currency';
import { ROUTES } from '@/constants/routes';
import type { TicketPass, TicketPassStatus } from '@/types';
import type { TicketsStackParamList } from '@/navigation/types';

const FILTERS: Array<TicketPassStatus | 'all'> = [
  'all',
  'valid',
  'used',
  'reserved',
  'expired',
  'refunded',
];

export function TicketWalletScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<TicketsStackParamList>>();
  const [filter, setFilter] = useState<TicketPassStatus | 'all'>('all');
  const passes = useTicketPasses(filter);

  const renderItem: ListRenderItem<TicketPass> = useCallback(
    ({ item }) => (
      <PassRow
        ticket={item}
        onPress={() =>
          navigation.navigate(ROUTES.TicketDetails, { ticketId: item.id })
        }
      />
    ),
    [navigation],
  );

  const header = useMemo(
    () => (
      <View>
        <Header showBack title="My virtual cards" />
        <Text variant="caption" secondary style={{ marginBottom: 14 }}>
          {passes.length} ticket cards (Free / Paid) · ma aha invitation
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          <Button
            title="Scan QR"
            size="sm"
            onPress={() => navigation.navigate(ROUTES.QrScanner)}
          />
          <Button
            title="History"
            size="sm"
            variant="outline"
            onPress={() => navigation.navigate(ROUTES.TicketHistory, {})}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, marginBottom: 14 }}
        >
          {FILTERS.map((item) => {
            const active = filter === item;
            return (
              <FilterChip
                key={item}
                label={item}
                active={active}
                onPress={() => setFilter(item)}
              />
            );
          })}
        </ScrollView>
      </View>
    ),
    [filter, navigation, passes.length],
  );

  return (
    <Screen padded={false}>
      <FlatList
        data={passes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            icon="ticket-outline"
            title="No tickets yet"
            description="Buy or reserve a pass from the marketplace to fill your wallet."
            actionLabel="Browse marketplace"
            onAction={() => navigation.navigate(ROUTES.TicketsMain)}
            compact
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 32,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        windowSize={7}
        removeClippedSubviews
      />
    </Screen>
  );
}

const PassRow = memo(function PassRow({
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
        marginBottom: 10,
        borderRadius: radius['2xl'],
        backgroundColor: theme.card,
        padding: 14,
        borderWidth: theme.mode === 'dark' ? 1 : 0,
        borderColor: theme.border,
        ...elevation('sm', theme.mode),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text variant="bodyMedium" numberOfLines={1}>
            {ticket.eventTitle}
          </Text>
          <Text variant="caption" muted style={{ marginTop: 4 }}>
            {ticket.guestName} · {ticket.type}
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontFamily: 'DMSans_700Bold',
              fontSize: 13,
              letterSpacing: 1,
              color: colors.gold[600],
            }}
          >
            {ticket.code}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <Badge
            label={ticket.status}
            tone={ticketStatusTone(ticket.status)}
          />
          <Text variant="caption" muted>
            {formatCurrency(ticket.price)}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
});

const FilterChip = memo(function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <AnimatedPressable
      haptic
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: radius.full,
        backgroundColor: active ? colors.gold[500] : theme.card,
        borderWidth: 1,
        borderColor: active ? colors.gold[500] : theme.border,
      }}
    >
      <Text
        style={{
          fontFamily: 'DMSans_600SemiBold',
          fontSize: 12,
          color: active ? colors.navy[900] : theme.textSecondary,
          textTransform: 'capitalize',
        }}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
});
