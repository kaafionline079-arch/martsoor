import { View } from 'react-native';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CategoryPicker } from '@/components/ui/CategoryPicker';
import { useI18n } from '@/i18n';
import type { EventFormValues } from '@/features/events/schemas';

type Props = {
  control: Control<EventFormValues>;
  errors: FieldErrors<EventFormValues>;
  loading?: boolean;
  submitLabel: string;
  onSubmit: () => void;
  showStatus?: boolean;
};

export function EventForm({
  control,
  errors,
  loading,
  submitLabel,
  onSubmit,
}: Props) {
  const { t } = useI18n();

  return (
    <View>
      <Controller
        control={control}
        name="category"
        render={({ field: { onChange, value } }) => (
          <CategoryPicker
            value={value}
            onChange={onChange}
            error={errors.category?.message}
            containerStyle={{ marginBottom: 14 }}
          />
        )}
      />
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t('eventName')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.title?.message}
            containerStyle={{ marginBottom: 12 }}
          />
        )}
      />
      <Controller
        control={control}
        name="date"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t('eventDate')}
            placeholder="2026-08-15"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.date?.message}
            containerStyle={{ marginBottom: 12 }}
          />
        )}
      />
      <Controller
        control={control}
        name="time"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t('eventTime')}
            placeholder="18:00"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.time?.message}
            containerStyle={{ marginBottom: 12 }}
          />
        )}
      />
      <Controller
        control={control}
        name="location"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t('eventLocation')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.location?.message}
            containerStyle={{ marginBottom: 12 }}
          />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t('eventDetails')}
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            style={{
              minHeight: 72,
              textAlignVertical: 'top',
              paddingTop: 10,
            }}
            error={errors.description?.message}
            containerStyle={{ marginBottom: 28 }}
          />
        )}
      />
      <View style={{ marginTop: 16 }}>
        <Button
          title={submitLabel}
          fullWidth
          size="lg"
          loading={loading}
          onPress={onSubmit}
        />
      </View>
    </View>
  );
}
