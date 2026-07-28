import { memo } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { FadeInView } from '@/components/shared/FadeInView';
import { Header } from '@/components/shared/Header';
import { Screen } from '@/components/ui/Screen';

type Props = {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  showBack?: boolean;
};

/** Consistent missing-resource / failure recovery screen. */
export const ResultState = memo(function ResultState({
  title = 'Unavailable',
  message,
  actionLabel = 'Go back',
  onAction,
  showBack = true,
}: Props) {
  return (
    <Screen>
      <Header showBack={showBack} title={title} />
      <FadeInView>
        <View
          style={{ marginTop: 24 }}
          accessibilityRole="summary"
          accessibilityLiveRegion="polite"
        >
          <Text variant="body" secondary style={{ marginBottom: 20, lineHeight: 22 }}>
            {message}
          </Text>
          {onAction ? (
            <Button title={actionLabel} onPress={onAction} />
          ) : null}
        </View>
      </FadeInView>
    </Screen>
  );
});
