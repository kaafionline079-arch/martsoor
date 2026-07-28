import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';

/** Categories removed from main UX — kept as a stub screen. */
export function GuestCategoriesScreen() {
  return (
    <Screen>
      <Header showBack title="Categories" />
      <Text style={{ color: colors.navy[500] }}>
        Categories are simplified. Manage guests from Event → Guests.
      </Text>
    </Screen>
  );
}
