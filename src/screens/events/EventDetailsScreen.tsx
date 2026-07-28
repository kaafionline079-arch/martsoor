import { useMemo } from 'react';
import { ScrollView, View, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import {
  useNavigation,
  useRoute,
  type RouteProp,
  CommonActions,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import {
  EventModuleLinks,
  type EventModuleLink,
} from '@/components/events/EventModuleLinks';
import { useEventModuleData } from '@/features/events/hooks';
import { isWeddingCategory } from '@/features/events/categories';
import { useTheme } from '@/hooks/useTheme';
import type { EventsStackParamList } from '@/navigation/types';

const { width } = Dimensions.get('window');

export function EventDetailsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<EventsStackParamList>>();
  const route = useRoute<RouteProp<EventsStackParamList, 'EventDetails'>>();
  const theme = useTheme();
  const data = useEventModuleData(route.params.eventId);

  const goTicketsTab = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Tickets',
      }),
    );
  };

  const links: EventModuleLink[] = useMemo(() => {
    if (!data) return [];
    const { event, guestCount } = data;
    const wedding = isWeddingCategory(event.category);

    if (wedding) {
      return [
        {
          id: 'guests',
          label: 'Guests',
          hint: `${guestCount.total} marti`,
          icon: 'people-outline',
          onPress: () =>
            navigation.navigate('EventGuests', { eventId: event.id }),
        },
        {
          id: 'invite',
          label: 'Send Invitation',
          hint: 'WhatsApp / SMS',
          icon: 'mail-outline',
          onPress: () =>
            navigation.navigate('Invitation', { eventId: event.id }),
        },
      ];
    }

    return [
      {
        id: 'guests',
        label: 'Guests',
        hint: `${guestCount.total} guests`,
        icon: 'people-outline',
        onPress: () =>
          navigation.navigate('EventGuests', { eventId: event.id }),
      },
      {
        id: 'tickets',
        label: 'Tickets',
        hint: 'Free / Paid · virtual card',
        icon: 'ticket-outline',
        onPress: goTicketsTab,
      },
      {
        id: 'checkin',
        label: 'Check-in',
        hint: 'Scan ticket QR',
        icon: 'qr-code-outline',
        onPress: () =>
          navigation.navigate('QrScanner', { eventId: event.id }),
      },
    ];
  }, [data, navigation]);

  if (!data) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.background,
        }}
      >
        <Text>Event not found</Text>
        <Button
          title="Back"
          onPress={() => navigation.goBack()}
          style={{ marginTop: 16 }}
        />
      </SafeAreaView>
    );
  }

  const { event, guestCount } = data;
  const wedding = isWeddingCategory(event.category);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: event.coverImage }}
            style={{ width, height: width * 0.55 }}
            contentFit="cover"
          />
          <SafeAreaView
            edges={['top']}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
            }}
          >
            <IconButton
              name="chevron-back"
              accessibilityLabel="Go back"
              onPress={() => navigation.goBack()}
            />
            <IconButton
              name="create-outline"
              accessibilityLabel="Edit event"
              onPress={() =>
                navigation.navigate('EditEvent', { eventId: event.id })
              }
            />
          </SafeAreaView>
        </View>

        <View
          style={{
            marginTop: -20,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundColor: theme.card,
            paddingHorizontal: 20,
            paddingTop: 22,
            paddingBottom: 40,
            borderWidth: theme.mode === 'dark' ? 1 : 0,
            borderColor: theme.border,
          }}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Badge label={event.status} tone="gold" />
            {wedding ? (
              <Badge label="Invitation only" tone="success" />
            ) : (
              <Badge label="Tickets only" tone="navy" />
            )}
            {event.category ? (
              <Badge label={event.category} tone="muted" />
            ) : null}
          </View>
          <Text variant="h1" style={{ marginTop: 10, marginBottom: 6 }}>
            {event.title}
          </Text>
          {wedding ? (
            <Text secondary style={{ marginBottom: 12, lineHeight: 22 }}>
              Aroos = Invitation kaliya. Guests diiwaangeli, SMS/WhatsApp u dir. Tickets lama isticmaalo.
            </Text>
          ) : (
            <Text secondary style={{ marginBottom: 12, lineHeight: 22 }}>
              Event-kan waa Tickets. Marka qof iibsado ama free qaato, virtual card ayaa u soo baxaya.
            </Text>
          )}
          {event.description ? (
            <Text secondary style={{ marginBottom: 16, lineHeight: 22 }}>
              {event.description}
            </Text>
          ) : null}

          <InfoRow
            label="Date"
            value={`${event.date}${event.time ? ` · ${event.time}` : ''}`}
          />
          <InfoRow label="Location" value={event.location} />
          <InfoRow
            label={wedding ? 'Guests' : 'Guests / tickets'}
            value={
              wedding
                ? `${guestCount.total}`
                : `${guestCount.total} · ${event.ticketSold} sold`
            }
            last
          />

          <Text variant="h3" style={{ marginTop: 22, marginBottom: 12 }}>
            {wedding ? 'Invitation' : 'Tickets & check-in'}
          </Text>
          <EventModuleLinks links={links} />

          <View style={{ marginTop: 20, gap: 10 }}>
            <Button
              title={wedding ? 'Guests & invitations' : 'Guests'}
              fullWidth
              onPress={() =>
                navigation.navigate('EventGuests', { eventId: event.id })
              }
            />
            {!wedding ? (
              <Button
                title="Tickets"
                fullWidth
                variant="outline"
                onPress={goTicketsTab}
              />
            ) : null}
            <Button
              title="Delete event"
              fullWidth
              variant="danger"
              onPress={() =>
                navigation.navigate('DeleteEvent', { eventId: event.id })
              }
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.border,
      }}
    >
      <Text secondary style={{ fontFamily: 'DMSans_500Medium' }}>
        {label}
      </Text>
      <Text
        style={{
          fontFamily: 'DMSans_600SemiBold',
          flex: 1,
          textAlign: 'right',
          marginLeft: 12,
        }}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}
