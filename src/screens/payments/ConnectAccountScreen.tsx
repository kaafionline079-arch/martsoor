import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SuccessBurst } from '@/components/shared/SuccessBurst';
import { useWalletStore } from '@/store/walletStore';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/theme/colors';
import { radius, elevation } from '@/theme';
import { formatCurrency } from '@/utils/currency';
import { ROUTES } from '@/constants/routes';
import type { PaymentsStackParamList } from '@/navigation/types';

const schema = z.object({
  accountNumber: z.string().min(6, 'Geli ugu yaraan 6 digit'),
});

type FormValues = z.infer<typeof schema>;
type Provider = 'salaam' | 'merchant';

export function ConnectAccountScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<PaymentsStackParamList>>();
  const theme = useTheme();
  const { t } = useI18n();
  const connectAccount = useWalletStore((s) => s.connectAccount);
  const paymentAccount = useWalletStore((s) => s.paymentAccount);
  const wallet = useWalletStore((s) => s.wallet);
  const [provider, setProvider] = useState<Provider>('salaam');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ message: string; granted: number } | null>(
    null,
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      accountNumber: paymentAccount?.accountNumber ?? '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    try {
      const res = await connectAccount({
        provider,
        accountNumber: values.accountNumber.trim(),
      });
      setDone(res);
      Alert.alert(t('connectSuccess'), res.message);
    } catch (e) {
      Alert.alert(
        t('error'),
        e instanceof Error ? e.message : 'Account lama xiri karin.',
      );
    } finally {
      setLoading(false);
    }
  });

  if (done) {
    return (
      <Screen scroll>
        <Header showBack title={t('connectAccount')} />
        <View
          style={{
            alignItems: 'center',
            borderRadius: radius['3xl'],
            backgroundColor: theme.card,
            paddingVertical: 32,
            paddingHorizontal: 20,
            borderWidth: theme.mode === 'dark' ? 1 : 0,
            borderColor: theme.border,
            ...elevation('md', theme.mode),
            marginBottom: 22,
          }}
        >
          <SuccessBurst tone="success" />
          <Text
            style={{
              fontFamily: 'Fraunces_600SemiBold',
              fontSize: 26,
              color: theme.text,
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            {t('connectSuccess')}
          </Text>
          <Text
            variant="body"
            secondary
            style={{ textAlign: 'center', marginBottom: 16 }}
          >
            {done.message}
          </Text>
          {done.granted > 0 ? (
            <Text
              style={{
                fontFamily: 'DMSans_700Bold',
                fontSize: 28,
                color: colors.green[600],
              }}
            >
              +{formatCurrency(done.granted)}
            </Text>
          ) : null}
          <Text variant="caption" muted style={{ marginTop: 12 }}>
            Balance hadda: {formatCurrency(wallet.balance)}
          </Text>
        </View>
        <Button
          title="Wallet balance"
          fullWidth
          size="lg"
          onPress={() => navigation.navigate(ROUTES.Balance)}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Header showBack title={t('connectAccount')} />
      <Text variant="caption" secondary style={{ marginBottom: 18 }}>
        Ku xir Salaam Bank ama Merchant Account si aad balance u hesho. Lacag-bixinta iyo wallet kaliya — ma aha tickets ama invitation.
      </Text>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
        {(
          [
            { id: 'salaam' as const, label: 'Salaam Bank' },
            { id: 'merchant' as const, label: 'Merchant Account' },
          ] as const
        ).map((p) => {
          const active = provider === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => setProvider(p.id)}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: radius.lg,
                borderWidth: 1.5,
                borderColor: active ? colors.green[500] : theme.border,
                backgroundColor: active ? colors.green[50] : theme.card,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'DMSans_600SemiBold',
                  color: active ? colors.green[700] : theme.text,
                  fontSize: 13,
                  textAlign: 'center',
                }}
              >
                {p.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Controller
        control={control}
        name="accountNumber"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={
              provider === 'salaam'
                ? 'Salaam account / mobile'
                : 'Merchant account number'
            }
            placeholder="61xxxxxxx"
            keyboardType="phone-pad"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.accountNumber?.message}
            containerStyle={{ marginBottom: 22 }}
          />
        )}
      />

      <Button
        title="Connect — Success"
        fullWidth
        size="lg"
        loading={loading}
        onPress={onSubmit}
      />
    </Screen>
  );
}
