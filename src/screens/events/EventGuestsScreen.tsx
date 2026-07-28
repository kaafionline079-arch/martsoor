import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, View, type ListRenderItem } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { useEventModuleData } from '@/features/events/hooks';
import { isWeddingCategory } from '@/features/events/categories';
import { useGuestStore } from '@/store/guestStore';
import { useWalletStore } from '@/store/walletStore';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/currency';
import type { Guest } from '@/types';
import type { EventsStackParamList } from '@/navigation/types';

export function EventGuestsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<EventsStackParamList>>();
  const route = useRoute<RouteProp<EventsStackParamList, 'EventGuests'>>();
  const eventId = route.params.eventId;
  const fetchGuests = useGuestStore((s) => s.fetchGuests);
  const inviteAll = useGuestStore((s) => s.inviteAll);
  const payGuests = useWalletStore((s) => s.payGuests);
  const wallet = useWalletStore((s) => s.wallet);
  const data = useEventModuleData(eventId);
  const wedding = isWeddingCategory(data?.event.category);
  /** One amount for every guest — set in one place */
  const [perGuestAmount, setPerGuestAmount] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetchGuests(eventId);
  }, [eventId, fetchGuests]);

  const amountEach = Number(perGuestAmount) || 0;
  const guestCount = data?.guests.length ?? 0;
  const totalPay = useMemo(
    () => (amountEach > 0 ? amountEach * guestCount : 0),
    [amountEach, guestCount],
  );

  const onInviteAll = (channel: 'whatsapp' | 'sms') => {
    if (!data?.guests.length) {
      Alert.alert('Guests', 'Marka hore ku dar guests.');
      return;
    }
    Alert.alert(
      'Dir dhammaan?',
      `${data.guests.length} guest ayaa ${channel === 'sms' ? 'SMS' : 'WhatsApp'} loogu diri doonaa.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dir',
          onPress: async () => {
            setBusy(true);
            try {
              const res = await inviteAll(eventId, channel);
              Alert.alert('Guul!', res.message);
            } catch (e) {
              Alert.alert(
                'Error',
                e instanceof Error ? e.message : 'Failed',
              );
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  const onPayAll = () => {
    if (!data?.guests.length) {
      Alert.alert('Guests', 'Marka hore ku dar guests.');
      return;
    }
    if (!(amountEach > 0)) {
      Alert.alert(
        'Lacagta',
        'Hal meel ka qor lacagta qof walba (tusaale 50), ka dibna dir.',
      );
      return;
    }

    const payments = data.guests.map((g) => ({
      guestId: g.id,
      amount: amountEach,
    }));

    if (totalPay > wallet.available) {
      Alert.alert(
        'Balance',
        `Lacagta guud ${formatCurrency(totalPay)} waxay ka badan tahay balance-kaaga.`,
      );
      return;
    }

    Alert.alert(
      'Dir lacagta?',
      `${guestCount} qof × ${formatCurrency(amountEach)} = ${formatCurrency(totalPay)}\nBalance-kaaga ayaa laga jari doonaa.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dir',
          onPress: async () => {
            setBusy(true);
            try {
              const res = await payGuests({ eventId, payments });
              Alert.alert('Guul!', res.message);
              setPerGuestAmount('');
            } catch (e) {
              Alert.alert(
                'Error',
                e instanceof Error ? e.message : 'Payment failed',
              );
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  const renderItem: ListRenderItem<Guest> = useCallback(
    ({ item }) => (
      <GuestRow
        guest={item}
        onPress={() =>
          navigation.navigate('GuestDetails', {
            guestId: item.id,
            eventId,
          })
        }
      />
    ),
    [navigation, eventId],
  );

  if (!data) {
    return (
      <Screen>
        <Header showBack title="Guests" />
        <Text style={{ color: colors.navy[900] }}>Event not found</Text>
      </Screen>
    );
  }

  const { event, guests } = data;

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: 20 }}>
        <Header showBack title="Guests" />
        <Text
          style={{
            color: colors.navy[500],
            marginBottom: 12,
            fontFamily: 'DMSans_500Medium',
          }}
        >
          {event.title} · {guests.length}
        </Text>

        <Button
          title="Add guest"
          fullWidth
          size="lg"
          onPress={() => navigation.navigate('RegisterGuest', { eventId })}
          style={{ marginBottom: 10 }}
        />

        {wedding ? (
          <View style={{ gap: 8, marginBottom: 12 }}>
            <Button
              title="Dir dhammaan — WhatsApp"
              fullWidth
              variant="outline"
              loading={busy}
              onPress={() => onInviteAll('whatsapp')}
            />
            <Button
              title="Dir dhammaan — SMS"
              fullWidth
              variant="outline"
              loading={busy}
              onPress={() => onInviteAll('sms')}
            />

            <View
              style={{
                marginTop: 8,
                padding: 14,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.light.border,
                backgroundColor: colors.white,
              }}
            >
              <Text
                style={{
                  fontFamily: 'DMSans_600SemiBold',
                  fontSize: 14,
                  color: colors.navy[900],
                  marginBottom: 4,
                }}
              >
                Lacagta guests-ka (hal meel)
              </Text>
              <Text
                style={{
                  fontFamily: 'DMSans_400Regular',
                  fontSize: 12,
                  color: colors.navy[500],
                  marginBottom: 10,
                }}
              >
                Qof walba isla lacagtan ayaa heli doona.
              </Text>
              <Input
                label="Lacag qofkiiba ($)"
                keyboardType="decimal-pad"
                placeholder="50"
                value={perGuestAmount}
                onChangeText={(v) =>
                  setPerGuestAmount(v.replace(/[^0-9.]/g, ''))
                }
                containerStyle={{ marginBottom: 10 }}
              />
              <Text
                style={{
                  fontFamily: 'DMSans_500Medium',
                  fontSize: 13,
                  color: colors.navy[700],
                  marginBottom: 10,
                }}
              >
                {guestCount} qof × {formatCurrency(amountEach || 0)} ={' '}
                {formatCurrency(totalPay)}
              </Text>
              <Button
                title={`Dir lacagta dhammaan · ${formatCurrency(totalPay)}`}
                fullWidth
                size="lg"
                loading={busy}
                disabled={totalPay <= 0}
                onPress={onPayAll}
              />
              <Text
                style={{
                  marginTop: 8,
                  fontFamily: 'DMSans_400Regular',
                  fontSize: 12,
                  color: colors.navy[500],
                }}
              >
                Balance: {formatCurrency(wallet.available)}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <FlatList
        data={guests}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        ListEmptyComponent={
          <Text
            style={{
              textAlign: 'center',
              marginTop: 32,
              color: colors.navy[500],
            }}
          >
            Weli guests ma jiraan. Ku dar mid.
          </Text>
        }
      />
    </Screen>
  );
}

const GuestRow = memo(function GuestRow({
  guest,
  onPress,
}: {
  guest: Guest;
  onPress: () => void;
}) {
  return (
    <Card elev="sm" style={{ marginBottom: 10, padding: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Avatar name={guest.name} size={40} uri={guest.avatar || undefined} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={{
              fontFamily: 'DMSans_600SemiBold',
              fontSize: 15,
              color: colors.navy[900],
            }}
            onPress={onPress}
          >
            {guest.name}
          </Text>
          <Text
            style={{
              fontFamily: 'DMSans_400Regular',
              fontSize: 12,
              color: colors.navy[500],
              marginTop: 2,
            }}
          >
            {guest.phone || guest.email || '—'}
            {guest.invitationStatus === 'sent' ? ' · casuumad la diray' : ''}
          </Text>
        </View>
      </View>
    </Card>
  );
});
