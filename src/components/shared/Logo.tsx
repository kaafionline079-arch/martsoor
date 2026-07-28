import { View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useI18n } from '@/i18n';

const logoFull = require('../../../assets/logo.png');
const logoMark = require('../../../assets/logo-mark.png');

const LOGO_ASPECT = 1024 / 732;

type LogoProps = {
  /** full = icon + MARTISOOR; mark = icon only */
  variant?: 'full' | 'mark';
  height?: number;
  width?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

/** Official Martisoor logo — high-quality branded asset */
export function Logo({
  variant = 'full',
  height,
  width,
  style,
  imageStyle,
}: LogoProps) {
  const { t } = useI18n();
  const isMark = variant === 'mark';

  const h = height ?? (isMark ? 48 : 160);
  const w = width ?? (isMark ? h : Math.round(h * LOGO_ASPECT));

  return (
    <View
      style={[{ alignItems: 'center', justifyContent: 'center' }, style]}
      accessibilityRole="image"
      accessibilityLabel={t('appName')}
    >
      <Image
        source={isMark ? logoMark : logoFull}
        style={[{ width: w, height: h }, imageStyle]}
        contentFit="contain"
      />
    </View>
  );
}

export function BrandLogoMark({ size = 40 }: { size?: number }) {
  return <Logo variant="mark" height={size} width={size} />;
}
