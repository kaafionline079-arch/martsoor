import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useI18n } from '@/i18n';

const logoFull = require('../../../assets/logo.png');
const logoMark = require('../../../assets/logo-mark.png');

/** Full logo aspect: icon + MARTISOOR wordmark (1024×732) */
const LOGO_ASPECT = 1024 / 732;

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<Size, { height: number }> = {
  sm: { height: 52 },
  md: { height: 72 },
  lg: { height: 96 },
  xl: { height: 140 },
};

type Props = {
  size?: Size;
  style?: StyleProp<ViewStyle>;
  /** Icon only — no wordmark */
  iconOnly?: boolean;
};

/** Official Martisoor logo — high-quality branded asset */
export function BrandLockup({
  size = 'md',
  style,
  iconOnly = false,
}: Props) {
  const { t } = useI18n();
  const dim = SIZES[size];

  if (iconOnly) {
    const markSize = dim.height;
    return (
      <View style={style} accessibilityRole="image" accessibilityLabel={t('appName')}>
        <Image
          source={logoMark}
          style={{ width: markSize, height: markSize }}
          contentFit="contain"
        />
      </View>
    );
  }

  const height = dim.height;
  const width = Math.round(height * LOGO_ASPECT);

  return (
    <View
      style={[{ alignItems: 'center', justifyContent: 'center' }, style]}
      accessibilityRole="image"
      accessibilityLabel={t('appName')}
    >
      <Image
        source={logoFull}
        style={{ width, height }}
        contentFit="contain"
      />
    </View>
  );
}
