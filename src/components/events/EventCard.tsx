import { memo } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { AnimatedPressable } from '@/components/shared/AnimatedPressable';
import { useTheme } from '@/hooks/useTheme';
import { getCategoryOption } from '@/features/events/categories';
import { useI18n } from '@/i18n';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';
import type { EventItem, EventStatus } from '@/types';

const toneMap: Record<
  EventStatus,
  'gold' | 'navy' | 'muted' | 'success' | 'danger'
> = {
  draft: 'muted',
  upcoming: 'gold',
  live: 'success',
  completed: 'navy',
  cancelled: 'danger',
};

type Props = {
  event: EventItem;
  onPress: () => void;
};

export const EventCard = memo(function EventCard({ event, onPress }: Props) {
  const theme = useTheme();
  const { t } = useI18n();
  const cat = getCategoryOption(event.category);

  return (
    <AnimatedPressable
      haptic
      onPress={onPress}
      style={{
        marginBottom: 14,
        borderRadius: radius['2xl'],
        backgroundColor: theme.card,
        overflow: 'hidden',
        borderWidth: theme.mode === 'dark' ? 1 : 0,
        borderColor: theme.border,
        ...elevation('md', theme.mode),
      }}
    >
      <Image
        source={{ uri: event.coverImage }}
        style={{ width: '100%', height: 140 }}
        contentFit="cover"
        recyclingKey={event.id}
        transition={200}
      />
      <View style={{ padding: 14 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 8,
          }}
        >
          <Text variant="h3" style={{ flex: 1, paddingRight: 8 }}>
            {event.title}
          </Text>
          <Badge label={event.status} tone={toneMap[event.status]} />
        </View>
        <Text variant="caption" muted>
          {event.date} · {event.time}
        </Text>
        <Text variant="caption" secondary style={{ marginTop: 4 }}>
          {cat ? `${cat.emoji} ${t(cat.labelKey)} · ` : ''}
          {event.location}
        </Text>
        <View
          style={{
            marginTop: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              fontFamily: 'DMSans_600SemiBold',
              fontSize: 12,
              color: colors.gold[600],
            }}
          >
            {event.guestCount} guests
          </Text>
          <Text variant="caption" muted>
            {event.ticketSold}/{event.capacity} tickets
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
});
