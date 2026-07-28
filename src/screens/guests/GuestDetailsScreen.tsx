import { type ReactNode } from 'react';
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
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useGuest } from '@/features/guests/hooks';
import { useGuestStore } from '@/store/guestStore';
import { useEventStore } from '@/store/eventStore';
import { isWeddingCategory } from '@/features/events/categories';
import { colors } from '@/theme/colors';
import { radius } from '@/theme';
import type { EventsStackParamList } from '@/navigation/types';

export function GuestDetailsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<EventsStackParamList>>();
  const route = useRoute<RouteProp<EventsStackParamList, 'GuestDetails'>>();
  const guest = useGuest(route.params.guestId);
  const deleteGuest = useGuestStore((s) => s.deleteGuest);
  const event = useEventStore((s) =>
    s.events.find((e) => e.id === (guest?.eventId || route.params.eventId)),
  );
  const wedding = isWeddingCategory(event?.category);

  if (!guest) {
    return (
      <Screen>
        <Header showBack title="Guest" />
        <Text style={{ color: colors.navy[900] }}>Guest not found</Text>
      </Screen>
    );
  }

  const confirmDelete = () => {
    Alert.alert('Remove guest?', guest.name, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGuest(guest.id);
            navigation.goBack();
          } catch (e) {
            Alert.alert(
              'Error',
              e instanceof Error ? e.message : 'Could not delete',
            );
          }
        },
      },
    ]);
  };

  return (
    <Screen scroll>
      <Header showBack title="Guest" />
      <View
        style={{
          alignItems: 'center',
          borderRadius: radius['2xl'],
          backgroundColor: colors.white,
          paddingVertical: 24,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.light.border,
        }}
      >
        <Avatar name={guest.name} size={72} uri={guest.avatar || undefined} />
        <Text
          variant="h2"
          style={{ marginTop: 12, color: colors.navy[900] }}
        >
          {guest.name}
        </Text>
        <Text style={{ marginTop: 4, color: colors.navy[500] }}>
          {guest.phone || guest.email}
        </Text>
        {guest.qrCode ? (
          <View style={{ marginTop: 12 }}>
            <Badge label={guest.qrCode} tone="gold" />
          </View>
        ) : null}
      </View>

      <Row label="Event" value={guest.eventTitle} />
      <Row label="Status" value={guest.status} last={!wedding} />
      {wedding ? (
        <Row label="Invitation" value={guest.invitationStatus ?? 'draft'} last />
      ) : null}

      <View style={{ marginTop: 20, gap: 10 }}>
        {wedding ? (
          <Button
            title="Send invitation"
            fullWidth
            onPress={() =>
              navigation.navigate('Invitation', {
                guestId: guest.id,
                eventId: guest.eventId,
              })
            }
          />
        ) : null}
        <Button
          title="Remove guest"
          fullWidth
          variant="outline"
          onPress={confirmDelete}
        />
      </View>
    </Screen>
  );
}

function Row({
  label,
  value,
  last,
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
        paddingVertical: 12,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.light.border,
      }}
    >
      <Text style={{ color: colors.navy[500] }}>{label}</Text>
      <Text style={{ color: colors.navy[900], fontFamily: 'DMSans_600SemiBold' }}>
        {value}
      </Text>
    </View>
  );
}
