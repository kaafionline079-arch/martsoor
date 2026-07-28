import { memo, useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/theme';
import { motion } from '@/theme/motion';

type Props = {
  width?: number | `${number}%`;
  height?: number;
  style?: StyleProp<ViewStyle>;
  radiusSize?: number;
};

export const Skeleton = memo(function Skeleton({
  width = '100%',
  height = 16,
  style,
  radiusSize = radius.md,
}: Props) {
  const theme = useTheme();
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, {
        duration: motion.duration.slow + 200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [opacity]);

  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radiusSize,
          backgroundColor: theme.border,
        },
        anim,
        style,
      ]}
    />
  );
});

export const CardSkeleton = memo(function CardSkeleton() {
  return (
    <View style={{ marginBottom: 14 }}>
      <Skeleton height={140} radiusSize={radius['2xl']} style={{ marginBottom: 12 }} />
      <Skeleton height={16} width="70%" style={{ marginBottom: 8 }} />
      <Skeleton height={12} width="45%" />
    </View>
  );
});

export const ListSkeleton = memo(function ListSkeleton({
  rows = 5,
  withImage = false,
}: {
  rows?: number;
  withImage?: boolean;
}) {
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
      <Skeleton height={28} width="42%" style={{ marginBottom: 10 }} />
      <Skeleton height={12} width="58%" style={{ marginBottom: 18 }} />
      {Array.from({ length: rows }).map((_, i) =>
        withImage ? (
          <CardSkeleton key={i} />
        ) : (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
              gap: 12,
            }}
          >
            <Skeleton height={48} width={48} radiusSize={24} />
            <View style={{ flex: 1 }}>
              <Skeleton height={14} width="72%" style={{ marginBottom: 8 }} />
              <Skeleton height={12} width="48%" />
            </View>
          </View>
        ),
      )}
    </View>
  );
});

export const WalletSkeleton = memo(function WalletSkeleton() {
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
      <Skeleton height={28} width="36%" style={{ marginBottom: 10 }} />
      <Skeleton height={12} width="55%" style={{ marginBottom: 18 }} />
      <Skeleton height={168} radiusSize={radius['3xl']} style={{ marginBottom: 16 }} />
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
        <Skeleton height={40} width="30%" radiusSize={radius.lg} />
        <Skeleton height={40} width="28%" radiusSize={radius.lg} />
        <Skeleton height={40} width="28%" radiusSize={radius.lg} />
      </View>
      <Skeleton height={120} radiusSize={radius['2xl']} />
    </View>
  );
});
