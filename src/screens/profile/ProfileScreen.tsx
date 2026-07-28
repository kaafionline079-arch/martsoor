import { View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { AnimatedPressable } from '@/components/shared/AnimatedPressable';
import { useAuthStore } from '@/store';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/i18n';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';
import { formatDate } from '@/utils/format';
import { ROUTES } from '@/constants/routes';
import type { ProfileStackParamList } from '@/navigation/types';

const menuItems: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: 'EditProfile' | 'Settings';
}[] = [
  { icon: 'person-outline', label: 'Edit profile', route: ROUTES.EditProfile },
  { icon: 'settings-outline', label: 'Settings', route: ROUTES.Settings },
];

export function ProfileScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { t, locale, setLocale } = useI18n();

  const confirmLogout = () => {
    Alert.alert(t('logout'), 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: t('logout'),
        style: 'destructive',
        onPress: () => void logout(),
      },
    ]);
  };

  return (
    <Screen scroll>
      <Text variant="h1" style={{ marginBottom: 24, marginTop: 8 }}>
        {t('profile')}
      </Text>

      <View
        style={{
          marginBottom: 24,
          alignItems: 'center',
          borderRadius: radius['3xl'],
          backgroundColor: theme.card,
          paddingHorizontal: 20,
          paddingVertical: 28,
          borderWidth: theme.mode === 'dark' ? 1 : 0,
          borderColor: theme.border,
          ...elevation('md', theme.mode),
        }}
      >
        <Avatar uri={user?.avatar} name={user?.name ?? 'Guest'} size={84} />
        <Text variant="h2" style={{ marginTop: 16 }}>
          {user?.name}
        </Text>
        <Text variant="caption" secondary style={{ marginTop: 4 }}>
          {user?.email}
        </Text>
        {user?.memberSince ? (
          <Text variant="caption" muted style={{ marginTop: 8 }}>
            Member since {formatDate(user.memberSince)}
          </Text>
        ) : null}
      </View>

      <View
        style={{
          marginBottom: 24,
          overflow: 'hidden',
          borderRadius: radius['2xl'],
          backgroundColor: theme.card,
          borderWidth: theme.mode === 'dark' ? 1 : 0,
          borderColor: theme.border,
          ...elevation('sm', theme.mode),
        }}
      >
        {menuItems.map((item, index) => (
          <AnimatedPressable
            key={item.label}
            haptic
            onPress={() => navigation.navigate(item.route)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
              borderBottomColor: theme.border,
            }}
          >
            <View
              style={{
                marginRight: 12,
                height: 40,
                width: 40,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.md,
                backgroundColor: theme.primaryMuted,
              }}
            >
              <Ionicons name={item.icon} size={18} color={colors.gold[600]} />
            </View>
            <Text
              style={{
                flex: 1,
                fontFamily: 'DMSans_500Medium',
                fontSize: 15,
                color: theme.text,
              }}
            >
              {item.label}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.textMuted}
            />
          </AnimatedPressable>
        ))}
      </View>

      <Text variant="h3" style={{ marginBottom: 12 }}>
        {t('language')}
      </Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
        {(['so', 'en'] as const).map((code) => (
          <AnimatedPressable
            key={code}
            onPress={() => setLocale(code)}
            style={{
              flex: 1,
              paddingVertical: 14,
              borderRadius: radius.lg,
              borderWidth: 1.5,
              borderColor:
                locale === code ? colors.green[500] : theme.border,
              backgroundColor:
                locale === code ? colors.green[50] : theme.card,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'DMSans_600SemiBold',
                fontSize: 14,
                color: locale === code ? colors.green[700] : theme.text,
              }}
            >
              {code === 'so' ? t('somali') : t('english')}
            </Text>
          </AnimatedPressable>
        ))}
      </View>

      <Button
        title={t('logout')}
        variant="outline"
        fullWidth
        onPress={confirmLogout}
      />
    </Screen>
  );
}
