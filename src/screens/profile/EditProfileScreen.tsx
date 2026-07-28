import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  editProfileSchema,
  type EditProfileFormValues,
} from '@/features/auth/schemas';
import { useAuthStore } from '@/store';

export function EditProfileScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      line1: user?.address.line1 ?? '',
      city: user?.address.city ?? '',
      country: user?.address.country ?? '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    updateProfile({
      name: values.name,
      email: values.email,
      phone: values.phone,
      address: {
        line1: values.line1,
        city: values.city,
        country: values.country,
      },
    });
    setLoading(false);
    Alert.alert('Saved', 'Your profile was updated.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  });

  return (
    <Screen scroll>
      <Header showBack title="Edit profile" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Full name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
              containerStyle={{ marginBottom: 16 }}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              containerStyle={{ marginBottom: 16 }}
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
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.phone?.message}
              containerStyle={{ marginBottom: 16 }}
            />
          )}
        />
        <Controller
          control={control}
          name="line1"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Address"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.line1?.message}
              containerStyle={{ marginBottom: 16 }}
            />
          )}
        />
        <Controller
          control={control}
          name="city"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="City"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.city?.message}
              containerStyle={{ marginBottom: 16 }}
            />
          )}
        />
        <Controller
          control={control}
          name="country"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Country"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.country?.message}
              containerStyle={{ marginBottom: 24 }}
            />
          )}
        />
        <Button
          title="Save changes"
          fullWidth
          size="lg"
          loading={loading}
          onPress={onSubmit}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}
