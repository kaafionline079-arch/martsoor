import { View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';
import { AnimatedPressable } from '@/components/shared/AnimatedPressable';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  placeholder?: string;
  editable?: boolean;
  onPress?: () => void;
  style?: object;
};

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onClear,
  placeholder = 'Search Martisoor…',
  editable = true,
  onPress,
  style,
}: Props) {
  const theme = useTheme();

  return (
    <AnimatedPressable
      disabled={editable}
      onPress={onPress}
      style={[
        {
          height: 52,
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: radius.lg,
          borderWidth: 1.5,
          borderColor: theme.border,
          backgroundColor: theme.card,
          paddingHorizontal: 14,
          ...elevation('sm', theme.mode),
        },
        style,
      ]}
    >
      <Ionicons name="search-outline" size={20} color={colors.gold[500]} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        editable={editable}
        pointerEvents={editable ? 'auto' : 'none'}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        returnKeyType="search"
        style={{
          marginLeft: 10,
          flex: 1,
          fontFamily: 'DMSans_400Regular',
          fontSize: 15,
          color: theme.text,
        }}
      />
      {value.length > 0 && onClear ? (
        <AnimatedPressable haptic onPress={onClear} style={{ padding: 4 }}>
          <Ionicons name="close-circle" size={18} color={theme.textMuted} />
        </AnimatedPressable>
      ) : null}
    </AnimatedPressable>
  );
}
