import { memo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { AnimatedPressable } from '@/components/shared/AnimatedPressable';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/theme/colors';
import { radius } from '@/theme';

export type QuickActionItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

type Props = {
  actions: QuickActionItem[];
};

export const QuickActions = memo(function QuickActions({ actions }: Props) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      }}
    >
      {actions.map((action) => (
        <AnimatedPressable
          key={action.id}
          haptic
          onPress={action.onPress}
          style={{ width: '23%', marginBottom: 4 }}
        >
          <Card
            elev="sm"
            style={{
              alignItems: 'center',
              paddingVertical: 14,
              paddingHorizontal: 6,
            }}
          >
            <View
              style={{
                height: 40,
                width: 40,
                borderRadius: radius.full,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.primaryMuted,
                marginBottom: 8,
              }}
            >
              <Ionicons name={action.icon} size={18} color={colors.green[600]} />
            </View>
            <Text
              style={{
                fontFamily: 'DMSans_500Medium',
                fontSize: 11,
                color: colors.navy[900],
                textAlign: 'center',
              }}
              numberOfLines={1}
            >
              {action.label}
            </Text>
          </Card>
        </AnimatedPressable>
      ))}
    </View>
  );
});
