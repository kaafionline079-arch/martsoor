import { View } from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { FakeQrCode } from '@/components/tickets/FakeQrCode';
import { FadeInView } from '@/components/shared/FadeInView';
import { SuccessBurst } from '@/components/shared/SuccessBurst';
import { useTicketPass } from '@/features/tickets/hooks';
import { useTheme } from '@/hooks/useTheme';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';
import { formatDate } from '@/utils/format';
import { ROUTES } from '@/constants/routes';
import type { TicketsStackParamList } from '@/navigation/types';

export function CheckInSuccessScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<TicketsStackParamList>>();
  const route = useRoute<RouteProp<TicketsStackParamList, 'CheckInSuccess'>>();
  const theme = useTheme();
  const ticket = useTicketPass(route.params.ticketId);

  return (
    <Screen scroll>
      <Header showBack title="Check-in" />

      <FadeInView>
        <View
          style={{
            alignItems: 'center',
            borderRadius: radius['3xl'],
            backgroundColor: theme.card,
            paddingVertical: 28,
            paddingHorizontal: 20,
            borderWidth: theme.mode === 'dark' ? 1 : 0,
            borderColor: theme.border,
            ...elevation('md', theme.mode),
            marginBottom: 20,
          }}
        >
          <SuccessBurst tone="success" />
          <Text
            style={{
              fontFamily: 'Fraunces_600SemiBold',
              fontSize: 26,
              color: theme.text,
              marginBottom: 8,
            }}
          >
            Check-in success
          </Text>
          <Text
            variant="body"
            secondary
            style={{ textAlign: 'center', marginBottom: 18 }}
          >
            Guest verified locally. Ticket marked as used.
          </Text>

          {ticket ? (
            <FadeInView delay={140} variant="up">
              <FakeQrCode value={ticket.qrPayload} size={140} faded />
              <Text
                style={{
                  marginTop: 14,
                  fontFamily: 'DMSans_700Bold',
                  fontSize: 18,
                  letterSpacing: 1.5,
                  color: colors.gold[600],
                  textAlign: 'center',
                }}
              >
                {ticket.code}
              </Text>
              <Text
                variant="bodyMedium"
                style={{ marginTop: 10, textAlign: 'center' }}
              >
                {ticket.guestName}
              </Text>
              <Text
                variant="caption"
                muted
                style={{ marginTop: 4, textAlign: 'center' }}
              >
                {ticket.eventTitle} · {ticket.type}
              </Text>
              {ticket.scannedAt ? (
                <Text
                  variant="caption"
                  muted
                  style={{ marginTop: 8, textAlign: 'center' }}
                >
                  Scanned {formatDate(ticket.scannedAt)}
                </Text>
              ) : null}
            </FadeInView>
          ) : null}
        </View>
      </FadeInView>

      <FadeInView delay={200} style={{ gap: 12 }}>
        <Button
          title="Scan another"
          fullWidth
          onPress={() => navigation.replace(ROUTES.QrScanner)}
        />
        {ticket ? (
          <Button
            title="Ticket details"
            fullWidth
            variant="outline"
            onPress={() =>
              navigation.navigate(ROUTES.TicketDetails, {
                ticketId: ticket.id,
              })
            }
          />
        ) : null}
        <Button
          title="Marketplace"
          fullWidth
          variant="ghost"
          onPress={() => navigation.navigate(ROUTES.TicketsMain)}
        />
      </FadeInView>
    </Screen>
  );
}
