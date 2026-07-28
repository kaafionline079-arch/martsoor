import { useCallback } from 'react';
import { FlatList, View, type ListRenderItem } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDashboardData } from '@/features/dashboard/hooks';
import { useI18n } from '@/i18n';
import type { DashboardActivity } from '@/features/dashboard/selectors';
import { colors } from '@/theme/colors';
import { radius } from '@/theme';

const ICON_MAP: Record<
  DashboardActivity['icon'],
  keyof typeof Ionicons.glyphMap
> = {
  calendar: 'calendar-outline',
  people: 'people-outline',
  ticket: 'ticket-outline',
  wallet: 'wallet-outline',
  mail: 'mail-outline',
};

const TONE_COLOR: Record<DashboardActivity['tone'], string> = {
  gold: colors.green[600],
  navy: colors.navy[700],
  success: colors.green[600],
  danger: colors.error,
  muted: colors.navy[400],
};

export function NotificationsScreen() {
  const { t } = useI18n();
  const { activities } = useDashboardData();

  const renderItem: ListRenderItem<DashboardActivity> = useCallback(
    ({ item }) => (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          padding: 14,
          marginBottom: 10,
          borderRadius: radius.lg,
          backgroundColor: colors.white,
          borderWidth: 1,
          borderColor: colors.light.border,
        }}
      >
        <View
          style={{
            height: 40,
            width: 40,
            borderRadius: 12,
            backgroundColor: colors.green[50],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={ICON_MAP[item.icon]}
            size={18}
            color={TONE_COLOR[item.tone]}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={{
              fontFamily: 'DMSans_600SemiBold',
              fontSize: 15,
              color: colors.navy[900],
            }}
          >
            {item.title}
          </Text>
          <Text
            style={{
              marginTop: 4,
              fontFamily: 'DMSans_400Regular',
              fontSize: 13,
              color: colors.navy[500],
            }}
          >
            {item.subtitle}
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontFamily: 'DMSans_400Regular',
              fontSize: 11,
              color: colors.navy[400],
            }}
          >
            {item.time}
          </Text>
        </View>
      </View>
    ),
    [],
  );

  return (
    <Screen scroll={false} padded={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Header showBack title={t('notifications')} />
      </View>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 24,
          flexGrow: activities.length === 0 ? 1 : undefined,
        }}
        ListEmptyComponent={
          <EmptyState
            title={t('noNotifications')}
            description={t('noNotificationsHint')}
            icon="notifications-outline"
          />
        }
      />
    </Screen>
  );
}
