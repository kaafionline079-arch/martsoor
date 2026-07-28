import { memo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { AnimatedPressable } from '@/components/shared/AnimatedPressable';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/theme/colors';
import { radius } from '@/theme';

export type EventModuleLink = {
  id: string;
  label: string;
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

type Props = {
  links: EventModuleLink[];
};

export const EventModuleLinks = memo(function EventModuleLinks({ links }: Props) {
  const theme = useTheme();

  return (
    <View style={{ gap: 10 }}>
      {links.map((link) => (
        <AnimatedPressable key={link.id} haptic onPress={link.onPress}>
          <Card
            elev="sm"
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <View
              style={{
                height: 42,
                width: 42,
                borderRadius: radius.md,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.primaryMuted,
                marginRight: 12,
              }}
            >
              <Ionicons name={link.icon} size={18} color={colors.gold[600]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium">{link.label}</Text>
              <Text variant="caption" muted style={{ marginTop: 2 }}>
                {link.hint}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.textMuted}
            />
          </Card>
        </AnimatedPressable>
      ))}
    </View>
  );
});
