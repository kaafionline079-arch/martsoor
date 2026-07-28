import { memo, useEffect } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  Easing,
  ZoomIn,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { motion } from '@/theme/motion';
import { colors } from '@/theme/colors';

type Props = {
  tone?: 'success' | 'danger';
  size?: number;
};

/** Spring check / fail mark — runs on UI thread. */
export const SuccessBurst = memo(function SuccessBurst({
  tone = 'success',
  size = 76,
}: Props) {
  const theme = useTheme();
  const ring = useSharedValue(0.6);
  const glow = useSharedValue(0);

  useEffect(() => {
    ring.value = withSpring(1, motion.spring.snappy);
    glow.value = withDelay(
      80,
      withTiming(1, { duration: motion.duration.slow, easing: Easing.out(Easing.cubic) }),
    );
  }, [glow, ring]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ring.value }],
    opacity: 0.35 + glow.value * 0.65,
  }));

  const isSuccess = tone === 'success';
  const accent = isSuccess ? '#1F9D6A' : theme.danger;
  const softBg = isSuccess
    ? theme.mode === 'dark'
      ? colors.navy[800]
      : '#E8F7F0'
    : theme.mode === 'dark'
      ? colors.navy[800]
      : '#FDECEC';

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size + 28,
            height: size + 28,
            borderRadius: (size + 28) / 2,
            borderWidth: 2,
            borderColor: accent,
          },
          ringStyle,
        ]}
      />
      <Animated.View
        entering={ZoomIn.springify()
          .damping(motion.spring.snappy.damping)
          .stiffness(motion.spring.snappy.stiffness)}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: softBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons
          name={isSuccess ? 'checkmark-circle' : 'close-circle'}
          size={size * 0.58}
          color={accent}
        />
      </Animated.View>
    </View>
  );
});
