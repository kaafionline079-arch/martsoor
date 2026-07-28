import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Pressable, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useGuest } from '@/features/guests/hooks';
import { useGuestStore } from '@/store/guestStore';
import { useI18n } from '@/i18n';
import { colors } from '@/theme/colors';
import { radius } from '@/theme';
import type { EventsStackParamList } from '@/navigation/types';

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
}

export function InvitationScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<EventsStackParamList>>();
  const route = useRoute<RouteProp<EventsStackParamList, 'Invitation'>>();
  const { t } = useI18n();
  const guestIdParam = route.params?.guestId ?? '';
  const eventId = route.params?.eventId;
  const guestFromStore = useGuest(guestIdParam);
  const guests = useGuestStore((s) => s.guests);
  const fetchGuests = useGuestStore((s) => s.fetchGuests);
  const inviteGuest = useGuestStore((s) => s.inviteGuest);
  const [selectedGuestId, setSelectedGuestId] = useState(guestIdParam);
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (eventId) void fetchGuests(eventId).catch(() => undefined);
  }, [eventId, fetchGuests]);

  const eventGuests = useMemo(
    () => (eventId ? guests.filter((g) => g.eventId === eventId) : []),
    [eventId, guests],
  );

  const guest =
    guestFromStore ||
    guests.find((g) => g.id === selectedGuestId) ||
    null;

  const onSend = async () => {
    if (!guest) {
      Alert.alert(
        'Dooro guest',
        'Marka hore dooro guest-ka aad casuumadda u diri lahayd.',
      );
      return;
    }
    setLoading(true);
    try {
      const res = await inviteGuest(guest.id, channel);
      const phone = normalizePhone(guest.phone || '');
      const text = encodeURIComponent(res.inviteText);

      if (channel === 'whatsapp') {
        const url = phone
          ? `https://wa.me/${phone}?text=${text}`
          : `https://wa.me/?text=${text}`;
        await Linking.openURL(url).catch(() => undefined);
      } else {
        const url = phone
          ? `sms:${guest.phone}?body=${text}`
          : `sms:?body=${text}`;
        await Linking.openURL(url).catch(() => undefined);
      }

      Alert.alert(t('inviteSentTitle'), res.message || t('inviteSentBody'), [
        { text: t('done'), onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert(
        t('error'),
        e instanceof Error ? e.message : 'Casuumadda lama diri karin.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Header showBack title="Invitation" />
      <Text
        style={{
          color: colors.navy[900],
          fontFamily: 'DMSans_600SemiBold',
          fontSize: 18,
          marginBottom: 8,
        }}
      >
        {guest?.name ?? 'Dooro guest'}
      </Text>
      <Text style={{ color: colors.navy[500], marginBottom: 20 }}>
        Dooro sida aad ugu diri lahayd casuumadda (WhatsApp ama SMS)
      </Text>

      {!guestIdParam && eventGuests.length > 0 ? (
        <View style={{ marginBottom: 20, gap: 8 }}>
          <Text
            style={{
              fontFamily: 'DMSans_600SemiBold',
              fontSize: 13,
              color: colors.navy[700],
              marginBottom: 4,
            }}
          >
            Guests
          </Text>
          {eventGuests.map((g) => {
            const active = selectedGuestId === g.id;
            return (
              <Pressable
                key={g.id}
                onPress={() => setSelectedGuestId(g.id)}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: radius.lg,
                  borderWidth: 1.5,
                  borderColor: active ? colors.green[500] : colors.light.border,
                  backgroundColor: active ? colors.green[50] : colors.white,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'DMSans_600SemiBold',
                    color: colors.navy[900],
                  }}
                >
                  {g.name}
                </Text>
                <Text style={{ color: colors.navy[500], fontSize: 12, marginTop: 2 }}>
                  {g.phone || g.email || g.invitationStatus}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
        {(['whatsapp', 'sms'] as const).map((c) => (
          <Pressable
            key={c}
            onPress={() => setChannel(c)}
            style={{
              flex: 1,
              paddingVertical: 14,
              borderRadius: radius.lg,
              borderWidth: 1.5,
              borderColor:
                channel === c ? colors.green[500] : colors.light.border,
              backgroundColor:
                channel === c ? colors.green[50] : colors.white,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'DMSans_600SemiBold',
                color:
                  channel === c ? colors.green[700] : colors.navy[900],
              }}
            >
              {c === 'whatsapp' ? 'WhatsApp' : 'SMS'}
            </Text>
          </Pressable>
        ))}
      </View>

      <Button
        title={t('sendInvitation')}
        fullWidth
        size="lg"
        loading={loading}
        onPress={onSend}
      />
    </Screen>
  );
}
