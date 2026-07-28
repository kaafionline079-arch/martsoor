import { Component, type ErrorInfo, type ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { radius } from '@/theme';
import { logger } from '@/utils/logger';

type Props = {
  children: ReactNode;
  fallbackTitle?: string;
};

type State = {
  hasError: boolean;
  message?: string;
};

/**
 * Catches render-time failures so the app does not white-screen.
 * Does not catch async errors — wrap those with try/catch at call sites.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'Unexpected error',
    };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('ErrorBoundary caught render failure', {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  private reset = () => {
    this.setState({ hasError: false, message: undefined });
  };

  override render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 28,
          backgroundColor: colors.navy[900],
        }}
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
      >
        <View
          style={{
            width: '100%',
            maxWidth: 400,
            borderRadius: radius['3xl'],
            backgroundColor: colors.navy[800],
            padding: 24,
          }}
        >
          <Text
            style={{
              fontFamily: 'Fraunces_600SemiBold',
              fontSize: 22,
              color: colors.white,
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            {this.props.fallbackTitle ?? 'Something went wrong'}
          </Text>
          <Text
            style={{
              fontFamily: 'DMSans_400Regular',
              fontSize: 14,
              color: 'rgba(255,255,255,0.7)',
              textAlign: 'center',
              marginBottom: 20,
              lineHeight: 20,
            }}
          >
            {__DEV__
              ? this.state.message
              : 'Please try again. Your local data was not sent anywhere.'}
          </Text>
          <Button title="Try again" fullWidth onPress={this.reset} />
        </View>
      </View>
    );
  }
}
