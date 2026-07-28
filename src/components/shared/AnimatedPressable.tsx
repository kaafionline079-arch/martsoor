import { memo } from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { motion } from '@/theme/motion';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

type Props = PressableProps & {
  haptic?: boolean;
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
};

export const AnimatedPressable = memo(function AnimatedPressable({
  children,
  haptic = false,
  scaleTo = motion.pressScale,
  onPressIn,
  onPressOut,
  onPress,
  style,
  accessibilityRole,
  accessibilityState,
  disabled,
  ...rest
}: Props) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressableBase
      style={[style, animStyle]}
      disabled={disabled}
      accessibilityRole={accessibilityRole ?? (onPress ? 'button' : undefined)}
      accessibilityState={{
        disabled: Boolean(disabled),
        ...accessibilityState,
      }}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, motion.spring.press);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, motion.spring.snappy);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress?.(e);
      }}
      {...rest}
    >
      {children}
    </AnimatedPressableBase>
  );
});
