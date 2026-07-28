import { useCallback, useEffect, useMemo, memo } from 'react';
import { FlatList, View, type ListRenderItem } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { EventCard } from '@/components/events/EventCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useEvents } from '@/features/events/hooks';
import { useEventStore } from '@/store/eventStore';
import { ROUTES } from '@/constants/routes';
import type { EventItem } from '@/types';
import type { EventsStackParamList } from '@/navigation/types';

export function EventsListScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<EventsStackParamList>>();
  const events = useEvents('all');
  const hydrated = useEventStore((s) => s.hydrated);
  const fetchEvents = useEventStore((s) => s.fetchEvents);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  const renderItem: ListRenderItem<EventItem> = useCallback(
    ({ item }) => (
      <EventCard
        event={item}
        onPress={() =>
          navigation.navigate(ROUTES.EventDetails, { eventId: item.id })
        }
      />
    ),
    [navigation],
  );

  const header = useMemo(
    () => (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <View>
          <Text variant="h1">Events</Text>
          <Text variant="caption" muted style={{ marginTop: 4 }}>
            {events.length} events
          </Text>
        </View>
        <Button
          title="+"
          size="sm"
          onPress={() => navigation.navigate(ROUTES.CreateEvent)}
        />
      </View>
    ),
    [events.length, navigation],
  );

  if (!hydrated) {
    return (
      <Screen padded={false}>
        <ListSkeleton rows={5} withImage />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>{header}</View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="No events yet"
            description="Create your first event."
            actionLabel="Create event"
            onAction={() => navigation.navigate(ROUTES.CreateEvent)}
            compact
          />
        }
        contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}
