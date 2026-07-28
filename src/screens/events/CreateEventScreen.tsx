import { useState } from 'react';
import { Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { EventForm } from '@/components/events/EventForm';
import {
  eventFormSchema,
  type EventFormValues,
} from '@/features/events/schemas';
import { getCategoryOption } from '@/features/events/categories';
import { useEventStore } from '@/store/eventStore';
import { useI18n } from '@/i18n';
import type { EventsStackParamList } from '@/navigation/types';

export function CreateEventScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<EventsStackParamList>>();
  const route = useRoute<RouteProp<EventsStackParamList, 'CreateEvent'>>();
  const { t } = useI18n();
  const createEvent = useEventStore((s) => s.createEvent);
  const [loading, setLoading] = useState(false);

  const preset = getCategoryOption(route.params?.category);
  const defaultCategory = preset?.dbValue ?? 'Wedding';

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      date: '',
      time: '18:00',
      location: '',
      capacity: '100',
      category: defaultCategory,
      description: '',
      status: 'upcoming',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    try {
      const event = await createEvent({
        title: values.title,
        description: values.description ?? '',
        date: values.date,
        time: values.time || '18:00',
        location: values.location,
        capacity: Number(values.capacity || 100),
        category: values.category,
        status: 'upcoming',
      });
      Alert.alert(
        t('success'),
        `"${event.title}" waa la abuuray${values.time ? ` · saacadda ${values.time}` : ''}.`,
        [
          {
            text: t('done'),
            onPress: () =>
              navigation.replace('EventDetails', { eventId: event.id }),
          },
        ],
      );
    } catch (e) {
      Alert.alert(t('error'), e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  });

  return (
    <Screen scroll keyboard bottomPadding={180}>
      <Header showBack title={t('createEvent')} />
      <Text
        secondary
        style={{
          marginBottom: 12,
          fontFamily: 'DMSans_400Regular',
          fontSize: 13,
        }}
      >
        {t('selectCategory')} → {t('eventName')} → {t('eventDate')}
      </Text>
      <EventForm
        control={control}
        errors={errors}
        loading={loading}
        submitLabel={t('createEvent')}
        onSubmit={onSubmit}
      />
    </Screen>
  );
}
