import { useState } from 'react';
import { View, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/shared/Header';
import {
  registerSchema,
  type RegisterFormValues,
} from '@/features/auth/schemas';
import { useAuthStore } from '@/store';
import { AnimatedPressable } from '@/components/shared/AnimatedPressable';
import { useI18n } from '@/i18n';
import type { AuthStackParamList } from '@/navigation/types';

export function RegisterScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const register = useAuthStore((s) => s.register);
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setLoading(true);
      await register(
        values.name,
        values.email,
        values.password,
        values.phone,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Please try again.';
      Alert.alert(t('error'), message);
    } finally {
      setLoading(false);
    }
  });

  return (
    <Screen scroll>
      <Header showBack title={t('createAccount')} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View entering={FadeInDown.duration(420)}>
          <Text variant="h1" style={{ marginBottom: 8 }}>
            {t('createAccount')}
          </Text>
          <Text variant="caption" secondary style={{ marginBottom: 28 }}>
            {t('tagline')}
          </Text>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('yourName')}
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
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('yourNumber')}
                keyboardType="phone-pad"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phone?.message}
                containerStyle={{ marginBottom: 16 }}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('email')}
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
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('password')}
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                containerStyle={{ marginBottom: 16 }}
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('password')}
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
                containerStyle={{ marginBottom: 24 }}
              />
            )}
          />

          <Button
            title={t('createAccount')}
            fullWidth
            size="lg"
            loading={loading}
            onPress={onSubmit}
          />

          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <AnimatedPressable onPress={() => navigation.navigate('Login')}>
              <Text variant="caption">{t('haveAccount')}</Text>
            </AnimatedPressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
