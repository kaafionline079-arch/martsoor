import { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useGuestStore, type GuestDraft } from '@/store/guestStore';
import { useEventStore } from '@/store/eventStore';
import { colors } from '@/theme/colors';
import type { EventsStackParamList } from '@/navigation/types';

const SAMPLE = [
  { name: 'Ahmed Hassan', email: 'ahmed@mail.com', phone: '0611111111' },
  { name: 'Hodan Ali', email: 'hodan@mail.com', phone: '0622222222' },
  { name: 'Yusuf Omar', email: 'yusuf@mail.com', phone: '0633333333' },
];

export function ExcelUploadScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<EventsStackParamList>>();
  const route = useRoute<RouteProp<EventsStackParamList, 'ExcelUpload'>>();
  const eventId = route.params.eventId;
  const event = useEventStore((s) => s.events.find((e) => e.id === eventId));
  const importGuests = useGuestStore((s) => s.importGuests);
  const [loading, setLoading] = useState(false);

  const preview = useMemo(() => SAMPLE, []);

  const runImport = async () => {
    if (!event) {
      Alert.alert('No event', 'Open an event first.');
      return;
    }
    setLoading(true);
    try {
      const drafts: GuestDraft[] = preview.map((row) => ({
        name: row.name,
        email: row.email,
        phone: row.phone,
        eventId: event.id,
        eventTitle: event.title,
        category: 'general',
        status: 'invited',
        invitationStatus: 'sent',
        qrTicketStatus: 'pending',
      }));
      const count = await importGuests(drafts);
      Alert.alert('Imported', `${count} guests added`, [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate('EventGuests', { eventId: event.id }),
        },
      ]);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Header showBack title="Upload Excel" />
      <Text style={{ color: colors.navy[500], marginBottom: 16 }}>
        {event?.title ?? 'Event'} — demo rows (no real file picker yet)
      </Text>
      {preview.map((row) => (
        <View
          key={row.email}
          style={{
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: colors.light.border,
          }}
        >
          <Text style={{ color: colors.navy[900], fontFamily: 'DMSans_600SemiBold' }}>
            {row.name}
          </Text>
          <Text style={{ color: colors.navy[500], fontSize: 12 }}>{row.phone}</Text>
        </View>
      ))}
      <Button
        title="Import guests"
        fullWidth
        size="lg"
        loading={loading}
        style={{ marginTop: 24 }}
        onPress={runImport}
      />
    </Screen>
  );
}
