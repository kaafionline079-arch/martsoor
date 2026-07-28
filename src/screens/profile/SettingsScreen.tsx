import { Switch, View, Pressable } from 'react-native';
import { useState } from 'react';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/shared/Header';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { useThemeStore } from '@/store';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';
import { APP_CONFIG } from '@/constants/config';
import type { ThemeMode } from '@/theme';

export function SettingsScreen() {
  const theme = useTheme();
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const [notifications, setNotifications] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  return (
    <Screen scroll>
      <Header showBack title="Settings" />

      <Text variant="label" style={{ marginBottom: 12 }}>
        Appearance
      </Text>
      <View
        style={{
          marginBottom: 24,
          flexDirection: 'row',
          gap: 10,
          padding: 6,
          borderRadius: radius.lg,
          backgroundColor: theme.surface,
        }}
      >
        {(['light', 'dark', 'system'] as ThemeMode[]).map((option) => {
          const active = mode === option;
          return (
            <Pressable
              key={option}
              onPress={() => setMode(option)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 12,
                borderRadius: radius.md,
                backgroundColor: active ? colors.gold[500] : 'transparent',
                ...(active ? elevation('gold', theme.mode) : {}),
              }}
            >
              <Text
                style={{
                  fontFamily: 'DMSans_600SemiBold',
                  fontSize: 13,
                  color: active ? colors.navy[900] : theme.textSecondary,
                  textTransform: 'capitalize',
                }}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text variant="label" style={{ marginBottom: 12 }}>
        Preferences
      </Text>
      <View
        style={{
          marginBottom: 24,
          overflow: 'hidden',
          borderRadius: radius['2xl'],
          backgroundColor: theme.card,
          borderWidth: theme.mode === 'dark' ? 1 : 0,
          borderColor: theme.border,
          ...elevation('sm', theme.mode),
        }}
      >
        <SettingRow
          label="Push notifications"
          value={notifications}
          onChange={setNotifications}
        />
        <SettingRow
          label="Haptic feedback"
          value={haptics}
          onChange={setHaptics}
        />
        <SettingRow
          label="Marketing emails"
          value={marketing}
          onChange={setMarketing}
          last
        />
      </View>

      <Text variant="label" style={{ marginBottom: 12 }}>
        About
      </Text>
      <View
        style={{
          borderRadius: radius['2xl'],
          backgroundColor: theme.card,
          padding: 16,
          borderWidth: theme.mode === 'dark' ? 1 : 0,
          borderColor: theme.border,
          ...elevation('sm', theme.mode),
        }}
      >
        <InfoRow label="App" value={APP_CONFIG.name} />
        <InfoRow label="Version" value="1.0.0" />
        <InfoRow label="Data" value="Mock JSON only" last />
      </View>
    </Screen>
  );
}

function SettingRow({
  label,
  value,
  onChange,
  last = false,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.border,
      }}
    >
      <Text
        style={{
          fontFamily: 'DMSans_500Medium',
          fontSize: 15,
          color: theme.text,
        }}
      >
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: theme.border, true: colors.gold[300] }}
        thumbColor={value ? colors.gold[500] : colors.white}
      />
    </View>
  );
}

function InfoRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.border,
      }}
    >
      <Text variant="caption" muted>
        {label}
      </Text>
      <Text
        style={{
          fontFamily: 'DMSans_600SemiBold',
          fontSize: 13,
          color: theme.text,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
