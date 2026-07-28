import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { AnimatedPressable } from '@/components/shared/AnimatedPressable';
import { useTicketPasses } from '@/features/tickets/hooks';
import { useTicketPassStore } from '@/store/ticketPassStore';
import { useTheme } from '@/hooks/useTheme';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';
import { ROUTES } from '@/constants/routes';
import type { EventsStackParamList, TicketsStackParamList } from '@/navigation/types';

type ScannerNav = NativeStackNavigationProp<
  EventsStackParamList | TicketsStackParamList
>;

export function QrScannerScreen() {
  const navigation = useNavigation<ScannerNav>();
  const theme = useTheme();
  const checkIn = useTicketPassStore((s) => s.checkIn);
  const sampleTickets = useTicketPasses('all').slice(0, 8);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scanAnim]);

  const lineY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 196],
  });

  const runScan = async (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    setLoading(true);
    try {
      const outcome = await checkIn(value);
      if (outcome.result === 'success' && outcome.ticket) {
        navigation.replace(ROUTES.CheckInSuccess, {
          ticketId: outcome.ticket.id,
        });
        return;
      }
      if (outcome.result === 'already_used') {
        navigation.replace(ROUTES.AlreadyUsed, {
          ticketId: outcome.ticket?.id,
          reason: 'already_used',
        });
        return;
      }
      navigation.replace(ROUTES.AlreadyUsed, {
        ticketId: outcome.ticket?.id,
        reason: outcome.result === 'not_found' ? 'not_found' : 'invalid',
      });
    } catch (e) {
      navigation.replace(ROUTES.AlreadyUsed, {
        reason: 'invalid',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Header showBack title="QR scanner" />
      <Text variant="caption" secondary style={{ marginBottom: 16 }}>
        Mock camera UI — no device camera. Paste a code or tap a sample ticket.
      </Text>

      <View
        style={{
          alignSelf: 'center',
          width: 260,
          height: 260,
          borderRadius: radius['3xl'],
          backgroundColor: colors.navy[900],
          overflow: 'hidden',
          marginBottom: 20,
          ...elevation('lg', theme.mode),
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: 18,
            left: 18,
            right: 18,
            bottom: 18,
            borderWidth: 2,
            borderColor: colors.gold[500],
            borderRadius: radius['2xl'],
          }}
        />
        {[
          { v: 'top' as const, h: 'left' as const },
          { v: 'top' as const, h: 'right' as const },
          { v: 'bottom' as const, h: 'left' as const },
          { v: 'bottom' as const, h: 'right' as const },
        ].map(({ v, h }) => (
          <View
            key={`${v}-${h}`}
            style={{
              position: 'absolute',
              ...(v === 'top' ? { top: 28 } : { bottom: 28 }),
              ...(h === 'left' ? { left: 28 } : { right: 28 }),
              width: 28,
              height: 28,
              borderColor: colors.gold[400],
              borderTopWidth: v === 'top' ? 3 : 0,
              borderBottomWidth: v === 'bottom' ? 3 : 0,
              borderLeftWidth: h === 'left' ? 3 : 0,
              borderRightWidth: h === 'right' ? 3 : 0,
            }}
          />
        ))}
        <Animated.View
          style={{
            position: 'absolute',
            left: 36,
            right: 36,
            height: 2,
            backgroundColor: colors.gold[400],
            transform: [{ translateY: lineY }],
            opacity: 0.9,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 22,
            left: 0,
            right: 0,
            alignItems: 'center',
          }}
        >
          <Ionicons name="scan-outline" size={22} color={colors.gold[300]} />
          <Text
            style={{
              marginTop: 6,
              fontFamily: 'DMSans_500Medium',
              fontSize: 12,
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            Align QR within frame
          </Text>
        </View>
      </View>

      <Text variant="caption" muted style={{ marginBottom: 8 }}>
        Ticket code
      </Text>
      <TextInput
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
        placeholder="MRT-XXXX or TIX-XXXXXX"
        placeholderTextColor={theme.textMuted}
        style={{
          height: 52,
          borderRadius: radius.lg,
          borderWidth: 1.5,
          borderColor: theme.inputBorder,
          backgroundColor: theme.input,
          paddingHorizontal: 16,
          fontFamily: 'DMSans_600SemiBold',
          fontSize: 15,
          color: theme.text,
          letterSpacing: 1,
          marginBottom: 14,
        }}
      />
      <Button
        title="Scan & check in"
        fullWidth
        size="lg"
        loading={loading}
        onPress={() => runScan(code)}
      />

      <Text variant="bodyMedium" style={{ marginTop: 24, marginBottom: 10 }}>
        Simulate scan
      </Text>
      {sampleTickets.map((ticket) => (
        <AnimatedPressable
          key={ticket.id}
          haptic
          onPress={() => {
            setCode(ticket.code);
            runScan(ticket.code);
          }}
          style={{
            marginBottom: 8,
            borderRadius: radius.xl,
            backgroundColor: theme.card,
            padding: 12,
            borderWidth: theme.mode === 'dark' ? 1 : 0,
            borderColor: theme.border,
          }}
        >
          <Text variant="bodyMedium">{ticket.code}</Text>
          <Text variant="caption" muted style={{ marginTop: 2 }}>
            {ticket.eventTitle} · {ticket.status}
          </Text>
        </AnimatedPressable>
      ))}
    </Screen>
  );
}
