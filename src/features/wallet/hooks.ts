import { useMemo } from 'react';
import { useWalletStore } from '@/store/walletStore';

export function useWallet() {
  return useWalletStore((s) => s.wallet);
}

export function useDistributions() {
  return useWalletStore((s) => s.distributions);
}

export function useDistribution(id: string) {
  return useWalletStore((s) => s.distributions.find((d) => d.id === id));
}

export function usePaymentTransactions() {
  const transactions = useWalletStore((s) => s.transactions);
  return useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)),
    [transactions],
  );
}

export function usePaymentSummary(distributionId?: string) {
  const wallet = useWallet();
  const distributions = useDistributions();
  const transactions = usePaymentTransactions();
  const selected = distributionId
    ? distributions.find((d) => d.id === distributionId)
    : undefined;

  return useMemo(() => {
    const paid = distributions.filter((d) => d.status === 'paid');
    const pending = distributions.filter((d) => d.status !== 'paid');
    const paidTotal = paid.reduce((s, d) => s + d.amount, 0);
    const pendingTotal = pending.reduce((s, d) => s + d.amount, 0);
    const credits = transactions
      .filter((t) => t.type === 'credit' && t.status === 'completed')
      .reduce((s, t) => s + t.amount, 0);
    const debits = transactions
      .filter((t) => t.type === 'debit' && t.status === 'completed')
      .reduce((s, t) => s + t.amount, 0);

    return {
      wallet,
      selected,
      distributions,
      paidCount: paid.length,
      pendingCount: pending.length,
      paidTotal,
      pendingTotal,
      credits,
      debits,
      net: credits - debits,
      recent: transactions.slice(0, 5),
    };
  }, [distributionId, distributions, selected, transactions, wallet]);
}

export function usePaymentAttempt(id: string) {
  return useWalletStore((s) => s.attempts.find((a) => a.id === id));
}
