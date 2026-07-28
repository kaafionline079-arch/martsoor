import { forwardRef, useCallback } from 'react';
import {
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useScreenScroll } from '@/components/ui/Screen';
import { radius } from '@/theme';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export const Input = forwardRef<TextInput, Props>(function Input(
  {
    label,
    error,
    style,
    containerStyle,
    accessibilityLabel,
    onFocus,
    placeholderTextColor,
    ...rest
  },
  ref,
) {
  const theme = useTheme();
  const screenScroll = useScreenScroll();

  const isMultiline = Boolean(rest.multiline);

  const handleFocus = useCallback<NonNullable<TextInputProps['onFocus']>>(
    (event) => {
      onFocus?.(event);
      if (isMultiline) {
        setTimeout(() => {
          screenScroll?.scrollToEnd(true);
          screenScroll?.scrollBy(80, true);
        }, 120);
      }
    },
    [isMultiline, onFocus, screenScroll],
  );

  return (
    <View style={[{ width: '100%' }, containerStyle]}>
      {label ? (
        <Text
          style={{
            marginBottom: 8,
            fontFamily: 'DMSans_500Medium',
            fontSize: 13,
            color: theme.textSecondary,
          }}
          accessibilityRole="text"
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        accessibilityLabel={accessibilityLabel ?? label}
        placeholderTextColor={placeholderTextColor ?? theme.textMuted}
        style={[
          {
            minHeight: isMultiline ? 80 : 52,
            height: isMultiline ? undefined : 52,
            borderRadius: radius.lg,
            borderWidth: 1.5,
            borderColor: error ? theme.danger : theme.inputBorder,
            backgroundColor: theme.input,
            paddingHorizontal: 16,
            fontFamily: 'DMSans_400Regular',
            fontSize: 15,
            color: theme.text,
          },
          style,
        ]}
        onFocus={handleFocus}
        {...rest}
      />
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          style={{
            marginTop: 6,
            fontFamily: 'DMSans_400Regular',
            fontSize: 12,
            color: theme.danger,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
});
