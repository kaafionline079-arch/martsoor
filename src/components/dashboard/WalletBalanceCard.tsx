import { memo } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { elevation, radius } from '@/theme';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/currency';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  balance: number;
  available: number;
  pending: number;
  onPayments: () => void;
  onHistory: () => void;
};

export const WalletBalanceCard = memo(function WalletBalanceCard({
  balance,
  available,
  pending,
  onPayments,
  onHistory,
}: Props) {
  const theme = useTheme();

  return (
    <View
      style={{
        borderRadius: radius['3xl'],
        backgroundColor: colors.navy[900],
        padding: 20,
        marginBottom: 8,
        ...elevation('lg', theme.mode),
      }}
    >
      <Text
        variant="label"
        style={{ color: colors.gold[300], marginBottom: 8 }}
      >
        Wallet balance
      </Text>
      <Text
        style={{
          fontFamily: 'Fraunces_600SemiBold',
          fontSize: 36,
          color: colors.white,
          marginBottom: 16,
        }}
      >
        {formatCurrency(balance)}
      </Text>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <Mini
          label="Available"
          value={formatCurrency(available)}
        />
        <Mini label="Pending" value={formatCurrency(pending)} />
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button
          title="View wallet"
          size="sm"
          onPress={onPayments}
          style={{ flex: 1 }}
        />
        <Button
          title="History"
          size="sm"
          variant="secondary"
          onPress={onHistory}
          style={{
            flex: 1,
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            borderColor: 'rgba(201,163,78,0.4)',
          }}
        />
      </View>
    </View>
  );
});

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flex: 1,
        borderRadius: radius.lg,
        backgroundColor: 'rgba(255,255,255,0.08)',
        padding: 12,
      }}
    >
      <Text
        style={{
          fontFamily: 'DMSans_400Regular',
          fontSize: 11,
          color: 'rgba(255,255,255,0.55)',
          marginBottom: 4,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: 'DMSans_700Bold',
          fontSize: 14,
          color: colors.gold[300],
        }}
      >
        {value}
      </Text>
    </View>
  );
}
