import { memo } from 'react';
import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/theme/colors';
import { radius } from '@/theme';

type Props = {
  value: string;
  size?: number;
  faded?: boolean;
};

/** Renders a real QR encoding local ticket payload (no backend). */
export const FakeQrCode = memo(function FakeQrCode({
  value,
  size = 200,
  faded = false,
}: Props) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignSelf: 'center',
        padding: 16,
        borderRadius: radius['2xl'],
        backgroundColor: colors.white,
        opacity: faded ? 0.35 : 1,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      <QRCode
        value={value || 'martisoor://ticket/invalid'}
        size={size}
        color={colors.navy[900]}
        backgroundColor={colors.white}
        ecl="M"
      />
    </View>
  );
});
