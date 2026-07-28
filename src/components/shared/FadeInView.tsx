import { memo, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeInUp,
} from 'react-native-reanimated';
import { motion } from '@/theme/motion';

type Props = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  variant?: 'fade' | 'up' | 'down' | 'right';
  style?: StyleProp<ViewStyle>;
};

/** UI-thread enter animation. Prefer over JS timers for 60 FPS. */
export const FadeInView = memo(function FadeInView({
  children,
  delay = 0,
  duration = motion.duration.normal,
  variant = 'up',
  style,
}: Props) {
  const entering =
    variant === 'up'
      ? FadeInUp.delay(delay).duration(duration)
      : variant === 'down'
        ? FadeInDown.delay(delay).duration(duration)
        : variant === 'right'
          ? FadeInRight.delay(delay).duration(duration)
          : FadeIn.delay(delay).duration(duration);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
});
