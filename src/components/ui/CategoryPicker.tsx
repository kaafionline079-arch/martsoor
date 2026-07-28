import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/i18n';
import {
  EVENT_CATEGORY_OPTIONS,
  type EventCategoryOption,
} from '@/features/events/categories';
import { colors } from '@/theme/colors';
import { radius } from '@/theme';

type Props = {
  value?: string;
  onChange: (dbValue: string) => void;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function CategoryPicker({
  value,
  onChange,
  error,
  containerStyle,
}: Props) {
  const { t } = useI18n();
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const selected = EVENT_CATEGORY_OPTIONS.find(
    (c) => c.dbValue === value || c.id === value,
  );

  const pick = (option: EventCategoryOption) => {
    onChange(option.dbValue);
    setOpen(false);
  };

  return (
    <View style={containerStyle}>
      <Text
        variant="label"
        style={{
          marginBottom: 6,
          fontFamily: 'DMSans_500Medium',
          fontSize: 13,
          color: theme.textSecondary,
          textTransform: 'none',
          letterSpacing: 0,
        }}
      >
        {t('eventCategory')}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 48,
          paddingHorizontal: 14,
          borderRadius: radius.lg,
          borderWidth: 1.5,
          borderColor: error ? theme.danger : theme.inputBorder,
          backgroundColor: theme.input,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 18, marginRight: 10 }}>
            {selected?.emoji ?? '📋'}
          </Text>
          <Text
            style={{
              fontFamily: 'DMSans_500Medium',
              fontSize: 15,
              color: selected ? theme.text : theme.textMuted,
            }}
            numberOfLines={1}
          >
            {selected ? t(selected.labelKey) : t('selectCategory')}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={theme.textMuted} />
      </Pressable>
      {error ? (
        <Text
          style={{
            marginTop: 6,
            fontSize: 12,
            color: theme.danger,
            fontFamily: 'DMSans_400Regular',
          }}
        >
          {error}
        </Text>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: theme.overlay,
            justifyContent: 'flex-end',
          }}
          onPress={() => setOpen(false)}
        >
          <Pressable
            style={{
              maxHeight: '70%',
              backgroundColor: theme.surfaceElevated,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: 24,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={{ alignItems: 'center', paddingVertical: 10 }}>
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: theme.border,
                }}
              />
            </View>
            <Text
              style={{
                paddingHorizontal: 20,
                paddingBottom: 12,
                fontFamily: 'DMSans_700Bold',
                fontSize: 17,
                color: theme.text,
              }}
            >
              {t('selectCategory')}
            </Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              {EVENT_CATEGORY_OPTIONS.map((option) => {
                const active = selected?.id === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => pick(option)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 14,
                      paddingHorizontal: 20,
                      backgroundColor: active
                        ? theme.primaryMuted
                        : theme.surfaceElevated,
                    }}
                  >
                    <Text style={{ fontSize: 22, width: 36 }}>{option.emoji}</Text>
                    <Text
                      style={{
                        flex: 1,
                        fontFamily: active
                          ? 'DMSans_700Bold'
                          : 'DMSans_500Medium',
                        fontSize: 16,
                        color: active ? colors.green[600] : theme.text,
                      }}
                    >
                      {t(option.labelKey)}
                    </Text>
                    {active ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={colors.green[500]}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
