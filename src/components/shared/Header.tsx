import { View } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Text } from '@/components/ui/Text';
import { IconButton } from '@/components/ui/IconButton';
import { Logo } from '@/components/shared/Logo';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/theme/colors';

type Props = {
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
  right?: React.ReactNode;
};

export function Header({
  title,
  showBack = false,
  showMenu = false,
  right,
}: Props) {
  const navigation = useNavigation();

  return (
    <View
      style={{
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
      }}
    >
      <View style={{ width: 44 }}>
        {showBack ? (
          <IconButton
            name="chevron-back"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
          />
        ) : showMenu ? (
          <IconButton
            name="menu"
            accessibilityLabel="Open menu"
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          />
        ) : null}
      </View>
      {title ? (
        <Text
          variant="h3"
          numberOfLines={1}
          style={{ flex: 1, textAlign: 'center' }}
        >
          {title}
        </Text>
      ) : (
        <View style={{ flex: 1 }} />
      )}
      <View style={{ width: 44, alignItems: 'flex-end' }}>
        {right ?? <View style={{ width: 44 }} />}
      </View>
    </View>
  );
}

/**
 * Compact brand for Home / light screens — real logo mark (no heart placeholder).
 * Wordmark comes from the transparent logo asset or i18n appName.
 */
export function BrandMark() {
  return <Logo variant="full" height={56} />;
}

export function MenuButton() {
  const navigation = useNavigation();
  const theme = useTheme();
  const onLight = theme.mode === 'light';

  return (
    <IconButton
      name="menu"
      accessibilityLabel="Open menu"
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      variant={onLight ? 'elevated' : 'gold'}
      color={onLight ? colors.navy[900] : colors.white}
    />
  );
}
