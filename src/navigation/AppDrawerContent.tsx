import { View, Pressable, Text as RNText } from 'react-native';
import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { useNavigationState } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { BrandLockup } from '@/components/shared/BrandLockup';
import { useAuthStore } from '@/store';
import { useI18n } from '@/i18n';
import { TAB_CONFIG } from '@/navigation/tabConfig';
import { colors } from '@/theme/colors';
import { radius } from '@/theme';
import type { MainTabParamList } from '@/navigation/types';
import type { TranslationKey } from '@/i18n/dictionaries';

const LABEL_KEYS: Record<keyof MainTabParamList, TranslationKey> = {
  Home: 'home',
  Events: 'events',
  Tickets: 'tickets',
  Payments: 'payments',
  Profile: 'profile',
};

function getActiveTabName(
  state: DrawerContentComponentProps['state'],
): keyof MainTabParamList {
  const tabsRoute = state.routes[state.index];
  const tabState = tabsRoute?.state;
  if (!tabState || tabState.index == null) return 'Home';
  const route = tabState.routes[tabState.index];
  return (route?.name as keyof MainTabParamList) ?? 'Home';
};

function DrawerNavItem({
  icon,
  iconFocused,
  label,
  isActive,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: '100%',
        marginBottom: 6,
        borderRadius: radius.lg,
        backgroundColor: isActive
          ? colors.green[50]
          : pressed
            ? colors.green[50]
            : 'transparent',
        borderWidth: isActive ? 1.5 : 0,
        borderColor: colors.green[300],
      })}
    >
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 52,
          paddingVertical: 10,
          paddingHorizontal: 14,
        }}
      >
        <View
          style={{
            height: 40,
            width: 40,
            borderRadius: 12,
            backgroundColor: isActive ? colors.green[500] : colors.green[50],
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Ionicons
            name={isActive ? iconFocused : icon}
            size={22}
            color={isActive ? colors.white : colors.green[600]}
          />
        </View>
        <RNText
          numberOfLines={1}
          style={{
            marginLeft: 14,
            flexShrink: 1,
            fontFamily: isActive ? 'DMSans_700Bold' : 'DMSans_600SemiBold',
            fontSize: 17,
            color: isActive ? colors.green[700] : colors.navy[900],
          }}
        >
          {label}
        </RNText>
      </View>
    </Pressable>
  );
}

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const { navigation, state } = props;
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { t, locale, setLocale } = useI18n();

  const activeTab =
    useNavigationState((navState) => {
      const tabsRoute = navState?.routes.find((r) => r.name === 'Tabs');
      const tabState = tabsRoute?.state;
      if (!tabState || tabState.index == null) return 'Home';
      const route = tabState.routes[tabState.index];
      return (route?.name as keyof MainTabParamList) ?? 'Home';
    }) ?? getActiveTabName(state);

  const goTab = (tab: keyof MainTabParamList) => {
    navigation.navigate('Tabs', { screen: tab });
    navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flexGrow: 1, paddingTop: 0, alignItems: 'stretch' }}
      style={{ backgroundColor: colors.white }}
    >
      <View
        style={{
          backgroundColor: colors.green[500],
          paddingHorizontal: 22,
          paddingTop: 32,
          paddingBottom: 24,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <BrandLockup size="lg" />
        <Text
          style={{
            marginTop: 16,
            fontFamily: 'DMSans_700Bold',
            fontSize: 18,
            color: colors.white,
          }}
        >
          {user?.name ?? t('welcome')}
        </Text>
        <Text
          style={{
            marginTop: 4,
            fontFamily: 'DMSans_400Regular',
            fontSize: 14,
            color: 'rgba(255,255,255,0.88)',
          }}
          numberOfLines={1}
        >
          {user?.email ?? t('tagline')}
        </Text>
      </View>

      <View style={{ paddingTop: 18, paddingHorizontal: 14, width: '100%' }}>
        {TAB_CONFIG.map((item) => (
          <DrawerNavItem
            key={item.name}
            icon={item.icon}
            iconFocused={item.iconFocused}
            label={t(LABEL_KEYS[item.name])}
            isActive={activeTab === item.name}
            onPress={() => goTab(item.name)}
          />
        ))}
      </View>

      <View style={{ flex: 1, minHeight: 12 }} />

      <View
        style={{
          paddingHorizontal: 22,
          paddingBottom: 30,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.light.border,
          width: '100%',
        }}
      >
        <Text
          style={{
            fontFamily: 'DMSans_500Medium',
            fontSize: 13,
            color: colors.navy[500],
            marginBottom: 10,
          }}
        >
          {t('language')}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          {(['so', 'en'] as const).map((code) => (
            <Pressable
              key={code}
              onPress={() => setLocale(code)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: radius.md,
                borderWidth: 1.5,
                borderColor:
                  locale === code ? colors.green[500] : colors.light.border,
                backgroundColor:
                  locale === code ? colors.green[50] : colors.white,
                alignItems: 'center',
              }}
            >
              <RNText
                style={{
                  fontFamily: 'DMSans_600SemiBold',
                  fontSize: 14,
                  color:
                    locale === code ? colors.green[700] : colors.navy[800],
                }}
              >
                {code === 'so' ? t('somali') : t('english')}
              </RNText>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => void logout()}
          style={{ width: '100%' }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
            }}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.error} />
            <RNText
              style={{
                marginLeft: 12,
                fontFamily: 'DMSans_600SemiBold',
                fontSize: 16,
                color: colors.error,
              }}
            >
              {t('logout')}
            </RNText>
          </View>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
}
