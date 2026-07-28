import { memo } from 'react';
import { ActivityIndicator, Text, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/shared/AnimatedPressable';
import { useTheme } from '@/hooks/useTheme';
import { elevation, motion, radius } from '@/theme';
import { colors } from '@/theme/colors';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  /** Override label color (e.g. on dark hero screens) */
  titleColor?: string;
  accessibilityHint?: string;
};

const heights: Record<Size, number> = { sm: 40, md: 48, lg: 56 };
const textSizes: Record<Size, number> = { sm: 13, md: 15, lg: 16 };

export const Button = memo(function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  titleColor,
  accessibilityHint,
}: Props) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const bg =
    variant === 'primary'
      ? colors.green[500]
      : variant === 'secondary'
        ? theme.secondary
        : variant === 'danger'
          ? colors.error
          : 'transparent';

  const resolvedTextColor =
    titleColor ??
    (variant === 'primary' || variant === 'secondary' || variant === 'danger'
      ? colors.white
      : variant === 'outline'
        ? theme.textSecondary
        : theme.primary);

  const resolvedBorderColor =
    variant === 'outline'
      ? titleColor
        ? `${titleColor}88`
        : theme.borderStrong
      : 'transparent';

  return (
    <AnimatedPressable
      haptic
      disabled={isDisabled}
      onPress={onPress}
      scaleTo={0.97}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        {
          height: heights[size],
          paddingHorizontal: size === 'sm' ? 16 : 22,
          borderRadius: radius.lg,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bg,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: resolvedBorderColor,
          opacity: isDisabled ? 0.45 : 1,
          width: fullWidth ? '100%' : undefined,
          ...(variant === 'primary' ? elevation('gold', theme.mode) : {}),
        },
        style,
      ]}
    >
      {loading ? (
        <Animated.View
          entering={FadeIn.duration(motion.duration.fast)}
          exiting={FadeOut.duration(120)}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <ActivityIndicator color={resolvedTextColor} />
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(motion.duration.fast)}>
          <Text
            style={{
              fontFamily: 'DMSans_600SemiBold',
              fontSize: textSizes[size],
              color: resolvedTextColor,
              letterSpacing: 0.2,
            }}
          >
            {title}
          </Text>
        </Animated.View>
      )}
    </AnimatedPressable>
  );
});
