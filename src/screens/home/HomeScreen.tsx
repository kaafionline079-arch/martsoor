import { useCallback, useMemo, memo, useState, useRef } from 'react';
import {
  FlatList,
  View,
  TextInput,
  Pressable,
  type ListRenderItem,
  type FlatList as FlatListType,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/components/ui/Text';
import { BrandLockup } from '@/components/shared/BrandLockup';
import { AnimatedPressable } from '@/components/shared/AnimatedPressable';
import { useDashboardData } from '@/features/dashboard/hooks';
import {
  EVENT_CATEGORY_OPTIONS,
  filterEventsByCategory,
  getCategoryOption,
  type EventCategoryId,
} from '@/features/events/categories';
import { useEventStore } from '@/store/eventStore';
import { useThemeStore } from '@/store';
import { useI18n } from '@/i18n';
import type { TranslationKey } from '@/i18n/dictionaries';
import { colors } from '@/theme/colors';
import { radius } from '@/theme';
import type { EventItem } from '@/types';
import { ROUTES } from '@/constants/routes';
import type {
  HomeStackParamList,
  MainTabParamList,
} from '@/navigation/types';

type HomeNav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>,
  BottomTabNavigationProp<MainTabParamList>
>;

type Category = {
  id: EventCategoryId;
  labelKey: TranslationKey;
  emoji?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

const HOME_CATEGORIES: Category[] = [
  ...EVENT_CATEGORY_OPTIONS.map((c) => ({
    id: c.id,
    labelKey: c.labelKey,
    emoji: c.emoji,
  })),
  { id: 'all', labelKey: 'catAllEvents', icon: 'ticket-outline' },
];

type Row =
  | { key: string; type: 'top' }
  | { key: string; type: 'promo' }
  | { key: string; type: 'categories' }
  | { key: string; type: 'section' }
  | { key: string; type: 'event'; item: EventItem }
  | { key: string; type: 'empty' };

export function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const { t } = useI18n();
  const { activities } = useDashboardData();
  const events = useEventStore((s) => s.events);
  const listRef = useRef<FlatListType<Row>>(null);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategoryId>('all');
  const alertCount = activities.length;

  const themeMode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);

  const goEvents = useCallback(() => {
    navigation.navigate('Events', { screen: 'EventsList' });
  }, [navigation]);

  const goCreate = useCallback(() => {
    const category =
      selectedCategory !== 'all' ? selectedCategory : undefined;
    navigation.navigate('Events', {
      screen: 'CreateEvent',
      params: category ? { category } : undefined,
    });
  }, [navigation, selectedCategory]);

  const goEvent = useCallback(
    (eventId: string) => {
      navigation.navigate('Events', {
        screen: 'EventDetails',
        params: { eventId },
      });
    },
    [navigation],
  );

  const openMenu = useCallback(() => {
    navigation.dispatch(DrawerActions.openDrawer());
  }, [navigation]);

  const openNotifications = useCallback(() => {
    navigation.navigate(ROUTES.Notifications);
  }, [navigation]);

  const selectCategory = useCallback((categoryId: EventCategoryId) => {
    setSelectedCategory(categoryId);
  }, []);

  const filtered = useMemo(() => {
    let list = events.filter(
      (e) => e.status === 'upcoming' || e.status === 'live',
    );
    list = filterEventsByCategory(list, selectedCategory);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          (e.category?.toLowerCase().includes(q) ?? false),
      );
    }
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [events, query, selectedCategory]);

  const rows: Row[] = useMemo(() => {
    const list: Row[] = [
      { key: 'top', type: 'top' },
      { key: 'promo', type: 'promo' },
      { key: 'categories', type: 'categories' },
      { key: 'section', type: 'section' },
    ];
    if (filtered.length === 0) list.push({ key: 'empty', type: 'empty' });
    else
      filtered.forEach((item) =>
        list.push({ key: item.id, type: 'event', item }),
      );
    return list;
  }, [filtered]);

  const renderItem: ListRenderItem<Row> = useCallback(
    ({ item }) => {
      switch (item.type) {
        case 'top':
          return (
            <HomeHeader
              t={t}
              alertCount={alertCount}
              query={query}
              onQuery={setQuery}
              onMenu={openMenu}
              onAlerts={openNotifications}
              onToggleTheme={toggleTheme}
              isDark={themeMode === 'dark'}
            />
          );
        case 'promo':
          return (
            <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
              <View
                style={{
                  backgroundColor: colors.green[500],
                  borderRadius: 20,
                  padding: 18,
                  minHeight: 110,
                  overflow: 'hidden',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'DMSans_700Bold',
                    fontSize: 18,
                    lineHeight: 25,
                    color: colors.white,
                  }}
                >
                  {t('promoTitle')}
                </Text>
                <Pressable
                  onPress={goCreate}
                  style={{
                    marginTop: 14,
                    alignSelf: 'flex-start',
                    backgroundColor: colors.white,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: radius.full,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'DMSans_600SemiBold',
                      fontSize: 13,
                      color: colors.green[700],
                    }}
                  >
                    {t('createEvent')}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        case 'categories':
          return (
            <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
              <Text
                style={{
                  fontFamily: 'DMSans_700Bold',
                  fontSize: 16,
                  color: colors.navy[900],
                  marginBottom: 12,
                }}
              >
                {t('categories')}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                }}
              >
                {HOME_CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                  <Pressable
                    key={cat.id}
                    onPress={() => selectCategory(cat.id)}
                    style={{
                      width: '31%',
                      alignItems: 'center',
                      marginBottom: 14,
                    }}
                  >
                    <View
                      style={{
                        height: 52,
                        width: 52,
                        borderRadius: 26,
                        backgroundColor: active ? colors.green[700] : colors.green[500],
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 6,
                        borderWidth: active ? 2 : 0,
                        borderColor: colors.green[800],
                      }}
                    >
                      {cat.emoji ? (
                        <Text style={{ fontSize: 22 }}>{cat.emoji}</Text>
                      ) : (
                        <Ionicons name={cat.icon!} size={22} color={colors.white} />
                      )}
                    </View>
                    <Text
                      style={{
                        fontFamily: active ? 'DMSans_700Bold' : 'DMSans_500Medium',
                        fontSize: 12,
                        color: active ? colors.green[700] : colors.navy[900],
                        textAlign: 'center',
                      }}
                      numberOfLines={1}
                    >
                      {t(cat.labelKey)}
                    </Text>
                  </Pressable>
                );
                })}
              </View>
            </View>
          );
        case 'section':
          return (
            <View
              style={{
                paddingHorizontal: 16,
                marginBottom: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'DMSans_700Bold',
                  fontSize: 16,
                  color: colors.navy[900],
                }}
              >
                {t('recentEvents')}
              </Text>
              <Text
                onPress={goEvents}
                style={{
                  color: colors.green[600],
                  fontFamily: 'DMSans_600SemiBold',
                  fontSize: 13,
                }}
              >
                {t('seeAll')}
              </Text>
            </View>
          );
        case 'empty':
          return (
            <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
              <Text
                style={{
                  color: colors.navy[500],
                  marginBottom: 12,
                  fontFamily: 'DMSans_400Regular',
                  fontSize: 15,
                  textAlign: 'center',
                }}
              >
                {selectedCategory === 'wedding'
                  ? t('noWeddingEvents')
                  : t('noEventsInCategory')}
              </Text>
              <Pressable
                onPress={goCreate}
                style={{
                  backgroundColor: colors.green[500],
                  paddingVertical: 12,
                  borderRadius: radius.lg,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontFamily: 'DMSans_600SemiBold',
                  }}
                >
                  {t('createEvent')}
                </Text>
              </Pressable>
            </View>
          );
        case 'event':
          return (
            <EventRow event={item.item} onPress={() => goEvent(item.item.id)} />
          );
        default:
          return null;
      }
    },
    [
      alertCount,
      goCreate,
      goEvent,
      goEvents,
      openNotifications,
      openMenu,
      query,
      selectCategory,
      selectedCategory,
      themeMode,
      toggleTheme,
      t,
    ],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <StatusBar style="light" />
      <FlatList
        ref={listRef}
        data={rows}
        keyExtractor={(r) => r.key}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        onScrollToIndexFailed={() => {
          listRef.current?.scrollToOffset({ offset: 280, animated: true });
        }}
      />
    </View>
  );
}

function HomeHeader({
  t,
  alertCount,
  query,
  onQuery,
  onMenu,
  onAlerts,
  onToggleTheme,
  isDark,
}: {
  t: (k: TranslationKey) => string;
  alertCount: number;
  query: string;
  onQuery: (v: string) => void;
  onMenu: () => void;
  onAlerts: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
}) {
  return (
    <View style={{ backgroundColor: colors.green[500] }}>
      <SafeAreaView edges={['top']}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Pressable
            onPress={onMenu}
            accessibilityLabel="Menu"
            hitSlop={10}
            style={{
              height: 48,
              width: 48,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="menu" size={34} color={colors.white} />
          </Pressable>

          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 4,
            }}
          >
            <BrandLockup size="lg" />
          </View>

          <Pressable
            onPress={onAlerts}
            accessibilityLabel={t('notifications')}
            style={{
              height: 44,
              minWidth: 44,
              paddingHorizontal: 12,
              borderRadius: 22,
              backgroundColor: 'rgba(255,255,255,0.22)',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
            }}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.white} />
            {alertCount > 0 ? (
              <Text
                style={{
                  fontFamily: 'DMSans_700Bold',
                  fontSize: 12,
                  color: colors.white,
                }}
              >
                {alertCount}
              </Text>
            ) : null}
          </Pressable>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            paddingBottom: 14,
            gap: 10,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.white,
              borderRadius: 14,
              paddingHorizontal: 12,
              height: 48,
            }}
          >
            <Ionicons name="location" size={20} color={colors.green[600]} />
            <TextInput
              value={query}
              onChangeText={onQuery}
              placeholder={t('searchEvents')}
              placeholderTextColor={colors.navy[400]}
              style={{
                flex: 1,
                marginLeft: 8,
                fontFamily: 'DMSans_500Medium',
                fontSize: 15,
                color: colors.navy[900],
              }}
            />
            <Ionicons name="search" size={20} color={colors.green[600]} />
          </View>
          <Pressable
            onPress={onToggleTheme}
            accessibilityLabel={t('toggleTheme')}
            style={{
              height: 48,
              width: 48,
              borderRadius: 14,
              backgroundColor: 'rgba(255,255,255,0.22)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={22}
              color={colors.white}
            />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const EventRow = memo(function EventRow({
  event,
  onPress,
}: {
  event: EventItem;
  onPress: () => void;
}) {
  const { t } = useI18n();
  const cat = getCategoryOption(event.category);

  return (
    <AnimatedPressable
      onPress={onPress}
      style={{
        marginHorizontal: 16,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.light.border,
      }}
    >
      <Image
        source={{ uri: event.coverImage }}
        style={{ width: 56, height: 56, borderRadius: 12 }}
        contentFit="cover"
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: 'DMSans_600SemiBold',
            fontSize: 15,
            color: colors.navy[900],
          }}
        >
          {event.title}
        </Text>
        {cat ? (
          <Text
            style={{
              marginTop: 2,
              fontSize: 11,
              color: colors.green[600],
              fontFamily: 'DMSans_500Medium',
            }}
          >
            {cat.emoji} {t(cat.labelKey)}
          </Text>
        ) : null}
        <Text
          style={{
            marginTop: 3,
            fontSize: 12,
            color: colors.navy[500],
            fontFamily: 'DMSans_400Regular',
          }}
        >
          {event.date} · {event.location}
        </Text>
      </View>
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: radius.full,
          backgroundColor: colors.green[50],
        }}
      >
        <Text
          style={{
            fontSize: 11,
            color: colors.green[700],
            fontFamily: 'DMSans_600SemiBold',
          }}
        >
          {event.guestCount}
        </Text>
      </View>
    </AnimatedPressable>
  );
});
