import { memo } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { AnimatedPressable } from '@/components/shared/AnimatedPressable';
import { getCategoryMeta } from '@/features/guests/hooks';
import { useTheme } from '@/hooks/useTheme';
import { elevation, radius } from '@/theme';
import type { Guest, GuestStatus, InvitationStatus, QrTicketStatus } from '@/types';

const statusTone: Record<GuestStatus, 'gold' | 'navy' | 'muted' | 'success' | 'danger'> = {
  invited: 'muted',
  confirmed: 'gold',
  declined: 'danger',
  checked_in: 'success',
};

type Props = {
  guest: Guest;
  onPress: () => void;
};

export const GuestRowCard = memo(function GuestRowCard({ guest, onPress }: Props) {
  const theme = useTheme();
  const category = getCategoryMeta(guest.category);

  return (
    <AnimatedPressable
      haptic
      onPress={onPress}
      style={{
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: radius['2xl'],
        backgroundColor: theme.card,
        padding: 12,
        borderWidth: theme.mode === 'dark' ? 1 : 0,
        borderColor: theme.border,
        ...elevation('sm', theme.mode),
      }}
    >
      <Avatar uri={guest.avatar} name={guest.name} size={48} />
      <View style={{ flex: 1, marginLeft: 12, paddingRight: 8 }}>
        <Text variant="bodyMedium" numberOfLines={1}>
          {guest.name}
        </Text>
        <Text variant="caption" muted style={{ marginTop: 2 }} numberOfLines={1}>
          {category?.name ?? 'General'} · {guest.eventTitle}
        </Text>
        <Text variant="caption" muted style={{ marginTop: 2 }} numberOfLines={1}>
          Invite {guest.invitationStatus ?? 'draft'} · QR{' '}
          {guest.qrTicketStatus ?? 'none'}
        </Text>
      </View>
      <Badge
        label={guest.status.replace('_', ' ')}
        tone={statusTone[guest.status]}
      />
    </AnimatedPressable>
  );
});

export function invitationTone(
  status?: InvitationStatus,
): 'gold' | 'navy' | 'muted' | 'success' | 'danger' {
  switch (status) {
    case 'accepted':
      return 'success';
    case 'declined':
      return 'danger';
    case 'opened':
    case 'delivered':
      return 'gold';
    case 'expired':
      return 'muted';
    default:
      return 'navy';
  }
}

export function qrTone(
  status?: QrTicketStatus,
): 'gold' | 'navy' | 'muted' | 'success' | 'danger' {
  switch (status) {
    case 'active':
      return 'gold';
    case 'scanned':
      return 'success';
    case 'revoked':
      return 'danger';
    case 'expired':
      return 'muted';
    case 'pending':
      return 'navy';
    default:
      return 'muted';
  }
}
