import { memo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressable } from '@/components/shared/AnimatedPressable';
import { useTheme } from '@/hooks/useTheme';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';

type Props = {
  name: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  size?: number;
  color?: string;
  haptic?: boolean;
  variant?: 'elevated' | 'ghost' | 'gold';
  /** Required for icon-only controls (screen readers). */
  accessibilityLabel: string;
};

export const IconButton = memo(function IconButton({
  name,
  onPress,
  size = 20,
  color,
  haptic = true,
  variant = 'elevated',
  accessibilityLabel,
}: Props) {
  const theme = useTheme();
  const iconColor =
    color ?? (variant === 'gold' ? colorsGoldOnNavy() : theme.text);

  return (
    <AnimatedPressable
      haptic={haptic}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={{
        height: 44,
        width: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.full,
        backgroundColor:
          variant === 'ghost'
            ? 'transparent'
            : variant === 'gold'
              ? theme.primary
              : theme.card,
        borderWidth: variant === 'elevated' && theme.mode === 'dark' ? 1 : 0,
        borderColor: theme.border,
        ...(variant === 'elevated' ? elevation('sm', theme.mode) : {}),
      }}
    >
      <Ionicons name={name} size={size} color={iconColor} />
    </AnimatedPressable>
  );
});

function colorsGoldOnNavy() {
  return colors.navy[900];
}
