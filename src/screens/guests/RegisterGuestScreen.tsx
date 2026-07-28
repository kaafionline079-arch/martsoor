import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useGuestStore } from '@/store/guestStore';
import { useEventStore } from '@/store/eventStore';
import { useI18n } from '@/i18n';
import { colors } from '@/theme/colors';
import type { EventsStackParamList } from '@/navigation/types';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

export function RegisterGuestScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<EventsStackParamList>>();
  const route = useRoute<RouteProp<EventsStackParamList, 'RegisterGuest'>>();
  const { t } = useI18n();
  const eventId = route.params.eventId;
  const createGuest = useGuestStore((s) => s.createGuest);
  const event = useEventStore((s) => s.events.find((e) => e.id === eventId));
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!event) {
      Alert.alert(t('error'), 'Event not found');
      return;
    }
    setLoading(true);
    try {
      const guest = await createGuest({
        name: values.name,
        email: values.email || '',
        phone: values.phone || '',
        eventId: event.id,
        eventTitle: event.title,
        category: 'general',
        status: 'invited',
        invitationStatus: 'draft',
        qrTicketStatus: 'pending',
        amount: 0,
      });

      Alert.alert(t('success'), `${guest.name} waa la diiwaangeliyay.`, [
        {
          text: t('done'),
          onPress: () =>
            navigation.replace('EventGuests', { eventId: event.id }),
        },
      ]);
    } catch (e) {
      Alert.alert(t('error'), e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  });

  return (
    <Screen scroll>
      <Header showBack title="Add guest" />
      <Text
        style={{
          color: colors.navy[500],
          marginBottom: 16,
          fontFamily: 'DMSans_500Medium',
        }}
      >
        {event?.title ?? 'Event'}
      </Text>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
              containerStyle={{ marginBottom: 14 }}
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Phone"
              keyboardType="phone-pad"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              containerStyle={{ marginBottom: 14 }}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email (optional)"
              autoCapitalize="none"
              keyboardType="email-address"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              containerStyle={{ marginBottom: 20 }}
            />
          )}
        />
        <Button
          title="Save guest"
          fullWidth
          size="lg"
          loading={loading}
          onPress={onSubmit}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}
