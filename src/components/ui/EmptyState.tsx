import { memo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Text } from './Text';
import { Button } from './Button';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/theme/colors';
import { motion, radius } from '@/theme';

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
};

export const EmptyState = memo(function EmptyState({
  icon = 'file-tray-outline',
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}: Props) {
  const theme = useTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(motion.duration.normal)}
      style={{
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: compact ? 36 : 64,
      }}
    >
      <Animated.View
        entering={ZoomIn.springify()
          .damping(motion.spring.soft.damping)
          .stiffness(motion.spring.soft.stiffness)}
        style={{
          marginBottom: 20,
          height: 68,
          width: 68,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radius.full,
          backgroundColor: theme.primaryMuted,
        }}
      >
        <Ionicons name={icon} size={28} color={colors.gold[600]} />
      </Animated.View>
      <Text variant="h3" style={{ marginBottom: 8, textAlign: 'center' }}>
        {title}
      </Text>
      {description ? (
        <Text
          variant="caption"
          secondary
          style={{ marginBottom: 24, textAlign: 'center', lineHeight: 20 }}
        >
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} />
      ) : null}
    </Animated.View>
  );
});
