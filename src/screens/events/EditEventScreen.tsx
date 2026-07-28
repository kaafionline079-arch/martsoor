import { useState } from 'react';
import { Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { EventForm } from '@/components/events/EventForm';
import {
  eventFormSchema,
  type EventFormValues,
} from '@/features/events/schemas';
import { getCategoryOption } from '@/features/events/categories';
import { useEvent } from '@/features/events/hooks';
import { useEventStore } from '@/store/eventStore';
import type { EventsStackParamList } from '@/navigation/types';

export function EditEventScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<EventsStackParamList>>();
  const route = useRoute<RouteProp<EventsStackParamList, 'EditEvent'>>();
  const event = useEvent(route.params.eventId);
  const updateEvent = useEventStore((s) => s.updateEvent);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.title ?? '',
      date: event?.date ?? '',
      time: event?.time ?? '',
      location: event?.location ?? '',
      capacity: String(event?.capacity ?? 100),
      budget: String(event?.budget ?? 0),
      category: getCategoryOption(event?.category)?.dbValue ?? event?.category ?? 'Wedding',
      description: event?.description ?? '',
      status: event?.status ?? 'draft',
    },
  });

  if (!event) {
    return (
      <Screen>
        <Header showBack title="Edit event" />
        <Text>Event not found</Text>
        <Button
          title="Back"
          onPress={() => navigation.goBack()}
          style={{ marginTop: 16 }}
        />
      </Screen>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    try {
      await updateEvent(event.id, {
        title: values.title,
        description: values.description,
        date: values.date,
        time: values.time,
        location: values.location,
        capacity: Number(values.capacity),
        budget: values.budget ? Number(values.budget) : event.budget,
        category: values.category,
        status: values.status ?? event.status,
      });
      Alert.alert('Guul!', 'Isbeddellada waa la keydiyay.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not update');
    } finally {
      setLoading(false);
    }
  });

  return (
    <Screen scroll keyboard bottomPadding={180}>
      <Header showBack title="Edit event" />
      <Text variant="caption" secondary style={{ marginBottom: 20 }}>
        Updating {event.title}
      </Text>
      <EventForm
        control={control}
        errors={errors}
        loading={loading}
        submitLabel="Save changes"
        onSubmit={onSubmit}
        showStatus
      />
      <Button
        title="Delete event"
        variant="danger"
        fullWidth
        style={{ marginTop: 12 }}
        onPress={() =>
          navigation.navigate('DeleteEvent', { eventId: event.id })
        }
      />
    </Screen>
  );
}
