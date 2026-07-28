import { View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';

export function EventGalleryScreen() {
  const navigation = useNavigation();
  return (
    <Screen>
      <Header showBack title="Gallery" />
      <Text style={{ color: colors.navy[500], marginBottom: 16 }}>
        Gallery simplified — use event cover for now.
      </Text>
      <Button title="Back" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

export function EventAttendanceScreen() {
  const navigation = useNavigation();
  return (
    <Screen>
      <Header showBack title="Attendance" />
      <Text style={{ color: colors.navy[500], marginBottom: 16 }}>
        Use Check-in from Event Details.
      </Text>
      <Button title="Back" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

export function EventStatisticsScreen() {
  const navigation = useNavigation();
  return (
    <Screen>
      <Header showBack title="Statistics" />
      <Text style={{ color: colors.navy[500], marginBottom: 16 }}>
        Stats live on the Home dashboard.
      </Text>
      <Button title="Back" onPress={() => navigation.goBack()} />
    </Screen>
  );
}
