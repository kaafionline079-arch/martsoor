import { View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n';
import { colors } from '@/theme/colors';
import { radius } from '@/theme';
import type { AuthStackParamList } from '@/navigation/types';

/** Welcome-only logo (white on black) — does not replace app header logos */
const welcomeLogo = require('../../../assets/logo-welcome.png');
const LOGO_ASPECT = 1024 / 732;
const LOGO_H = 150;
const LOGO_W = Math.round(LOGO_H * LOGO_ASPECT);

export function WelcomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { t, locale, setLocale } = useI18n();

  return (
    <View style={{ flex: 1, backgroundColor: colors.black }}>
      <StatusBar style="light" />
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingBottom: 20,
          paddingTop: 12,
        }}
      >
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={{ alignItems: 'center', marginBottom: 28 }}
        >
          <Image
            source={welcomeLogo}
            style={{ width: LOGO_W, height: LOGO_H }}
            contentFit="contain"
            accessibilityLabel={t('appName')}
          />
          <Text
            style={{
              marginTop: 10,
              fontFamily: 'DMSans_400Regular',
              fontSize: 15,
              lineHeight: 22,
              color: 'rgba(255,255,255,0.75)',
              textAlign: 'center',
              paddingHorizontal: 12,
            }}
          >
            {t('tagline')}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(80).duration(450)}>
          <Text
            style={{
              marginBottom: 8,
              fontFamily: 'DMSans_500Medium',
              fontSize: 13,
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            {t('chooseLanguage')}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              marginBottom: 18,
            }}
          >
            {(['so', 'en'] as const).map((code) => {
              const active = locale === code;
              return (
                <Pressable
                  key={code}
                  onPress={() => setLocale(code)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: radius.lg,
                    borderWidth: 1.5,
                    borderColor: active
                      ? colors.green[500]
                      : 'rgba(255,255,255,0.2)',
                    backgroundColor: active
                      ? 'rgba(69,172,77,0.18)'
                      : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'DMSans_600SemiBold',
                      fontSize: 14,
                      color: active ? colors.green[400] : colors.white,
                    }}
                  >
                    {code === 'so' ? t('somali') : t('english')}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Button
            title={t('login')}
            fullWidth
            size="lg"
            onPress={() => navigation.navigate('Login')}
            style={{ marginBottom: 12 }}
          />
          <Button
            title={t('register')}
            variant="outline"
            fullWidth
            size="lg"
            titleColor={colors.white}
            onPress={() => navigation.navigate('Register')}
            style={{
              borderColor: colors.green[500],
            }}
          />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
