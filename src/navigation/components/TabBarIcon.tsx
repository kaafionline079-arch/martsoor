import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { colors } from '@/theme/colors';

type Props = {
  name: keyof typeof Ionicons.glyphMap;
  focusedName?: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
  focused: boolean;
  badge?: number;
};

export function TabBarIcon({
  name,
  focusedName,
  color,
  size,
  focused,
  badge,
}: Props) {
  return (
    <View>
      <Ionicons
        name={focused ? focusedName ?? name : name}
        size={size}
        color={color}
      />
      {badge != null && badge > 0 ? (
        <View
          style={{
            position: 'absolute',
            right: -9,
            top: -5,
            minWidth: 15,
            alignItems: 'center',
            borderRadius: 999,
            backgroundColor: colors.gold[500],
            paddingHorizontal: 3,
          }}
        >
          <Text
            style={{
              fontFamily: 'DMSans_700Bold',
              fontSize: 9,
              color: colors.navy[900],
            }}
          >
            {badge > 9 ? '9+' : badge}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
