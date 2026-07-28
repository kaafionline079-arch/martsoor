import { memo } from 'react';
import { Text } from '@/components/ui/Text';
import { AnimatedPressable } from '@/components/shared/AnimatedPressable';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/theme/colors';
import { radius } from '@/theme';

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
  accent?: string;
};

/** Shared filter chip used across Events, Guests, Tickets, Payments. */
export const FilterChip = memo(function FilterChip({
  label,
  active,
  onPress,
  accent,
}: Props) {
  const theme = useTheme();
  const bg = active ? accent ?? colors.gold[500] : theme.card;
  const border = active ? accent ?? colors.gold[500] : theme.border;
  const textColor = active ? colors.white : theme.textSecondary;

  return (
    <AnimatedPressable
      haptic
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`Filter ${label}`}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: radius.full,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: border,
      }}
    >
      <Text
        style={{
          fontFamily: 'DMSans_600SemiBold',
          fontSize: 12,
          color: textColor,
          textTransform: 'capitalize',
        }}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
});
