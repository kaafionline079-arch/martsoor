import { View, Alert } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useEvent } from '@/features/events/hooks';
import { useTheme } from '@/hooks/useTheme';
import { useEventStore } from '@/store/eventStore';
import { colors } from '@/theme/colors';
import type { EventsStackParamList } from '@/navigation/types';

export function DeleteEventScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<EventsStackParamList>>();
  const route = useRoute<RouteProp<EventsStackParamList, 'DeleteEvent'>>();
  const event = useEvent(route.params.eventId);
  const deleteEvent = useEventStore((s) => s.deleteEvent);
  const theme = useTheme();

  if (!event) {
    return (
      <Screen>
        <Header showBack title="Delete event" />
        <Text>Event not found or already deleted.</Text>
        <Button
          title="Back to events"
          onPress={() => navigation.navigate('EventsList')}
          style={{ marginTop: 16 }}
        />
      </Screen>
    );
  }

  const confirmDelete = () => {
    Alert.alert('Delete event?', `Remove ${event.title}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEvent(event.id);
            navigation.navigate('EventsList');
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
      <Header showBack title="Delete event" />
      <Card elev="md" style={{ marginBottom: 20 }}>
        <Text variant="h3" style={{ marginBottom: 8 }}>
          {event.title}
        </Text>
        <Text variant="caption" secondary>
          {event.date} · {event.location}
        </Text>
        <Text style={{ marginTop: 14, lineHeight: 22 }} secondary>
          This removes the event from your local Martisoor data. Guest and ticket
          mock records remain unchanged. This cannot be undone on this device.
        </Text>
      </Card>

      <View style={{ gap: 12 }}>
        <Button
          title="Yes, delete event"
          variant="danger"
          fullWidth
          size="lg"
          onPress={confirmDelete}
        />
        <Button
          title="Cancel"
          variant="outline"
          fullWidth
          titleColor={theme.textSecondary}
          onPress={() => navigation.goBack()}
        />
      </View>

      <Text
        variant="caption"
        muted
        style={{ marginTop: 20, textAlign: 'center', color: colors.error }}
      >
        Permanent local delete
      </Text>
    </Screen>
  );
}
