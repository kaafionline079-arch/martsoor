import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';

/** Global guest list removed — use Event Details → Guests. */
export function GuestListScreen() {
  return (
    <Screen>
      <Header showBack title="Guests" />
      <Text style={{ color: colors.navy[900], marginBottom: 8 }}>
        Guests are inside each event.
      </Text>
      <Text style={{ color: colors.navy[500] }}>
        Open Events → Event → Guests.
      </Text>
    </Screen>
  );
}
