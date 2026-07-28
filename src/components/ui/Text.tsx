import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { typography } from '@/theme';

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodyMedium' | 'caption' | 'label';

type Props = TextProps & {
  variant?: Variant;
  muted?: boolean;
  secondary?: boolean;
  color?: string;
  style?: TextStyle | TextStyle[];
};

export function Text({
  variant = 'body',
  muted,
  secondary,
  color,
  style,
  children,
  ...rest
}: Props) {
  const theme = useTheme();
  const token = typography[variant];

  const resolvedColor =
    color ??
    (muted
      ? theme.textMuted
      : secondary
        ? theme.textSecondary
        : variant === 'label'
          ? theme.textMuted
          : theme.text);

  return (
    <RNText
      style={[
        {
          fontFamily: token.fontFamily,
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
          letterSpacing: 'letterSpacing' in token ? token.letterSpacing : 0,
          color: resolvedColor,
          textTransform: variant === 'label' ? 'uppercase' : 'none',
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}
