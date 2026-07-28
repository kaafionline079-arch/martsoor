import { useMemo } from 'react';
import { useTicketPassStore } from '@/store/ticketPassStore';
import type { TicketPassStatus } from '@/types';

export function useTicketPasses(status?: TicketPassStatus | 'all') {
  const passes = useTicketPassStore((s) => s.passes);
  return useMemo(() => {
    const list =
      !status || status === 'all'
        ? passes
        : passes.filter((p) => p.status === status);
    return [...list].sort((a, b) =>
      b.purchasedAt.localeCompare(a.purchasedAt),
    );
  }, [passes, status]);
}

export function useTicketPass(ticketId: string) {
  return useTicketPassStore((s) => s.passes.find((p) => p.id === ticketId));
}

export function useTicketHistory(ticketId?: string) {
  const history = useTicketPassStore((s) => s.history);
  return useMemo(() => {
    const list = ticketId
      ? history.filter((h) => h.ticketId === ticketId)
      : history;
    return [...list].sort((a, b) => b.at.localeCompare(a.at));
  }, [history, ticketId]);
}

export function ticketStatusTone(
  status: TicketPassStatus,
): 'gold' | 'navy' | 'muted' | 'success' | 'danger' {
  switch (status) {
    case 'valid':
      return 'gold';
    case 'used':
      return 'success';
    case 'reserved':
      return 'navy';
    case 'expired':
      return 'muted';
    case 'refunded':
      return 'danger';
    default:
      return 'muted';
  }
}
