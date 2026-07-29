import { create } from 'zustand';
import { walletApi } from '@/api';
import { isMockMode } from '@/constants/mockAuth';
import type {
  DistributionItem,
  PaymentTransaction,
  Wallet,
} from '@/types';

export type WalletPaymentAttempt = {
  id: string;
  distributionId: string;
  recipient: string;
  role: string;
  amount: number;
  status: 'success' | 'failed';
  createdAt: string;
  reference: string;
  failureReason?: string;
};

export type PaymentAccountInfo = {
  provider: 'salaam' | 'merchant' | string;
  accountNumber: string;
  connectedAt: string;
};

type WalletState = {
  wallet: Wallet;
  distributions: DistributionItem[];
  transactions: PaymentTransaction[];
  attempts: WalletPaymentAttempt[];
  paymentAccount: PaymentAccountInfo | null;
  hydrated: boolean;
  loading: boolean;
  fetchWallet: () => Promise<void>;
  getDistribution: (id: string) => DistributionItem | undefined;
  getAttempt: (id: string) => WalletPaymentAttempt | undefined;
  confirmPayment: (
    distributionId: string,
    options?: { forceFail?: boolean },
  ) => Promise<WalletPaymentAttempt | null>;
  distributeAll: () => Promise<string | undefined>;
  connectAccount: (input: {
    provider: 'salaam' | 'merchant';
    accountNumber: string;
  }) => Promise<{ message: string; granted: number }>;
  purchaseTicket: (input: {
    amount: number;
    eventTitle: string;
  }) => Promise<{ ok: boolean; message: string; free?: boolean }>;
  payGuests: (input: {
    eventId: string;
    payments?: Array<{ guestId: string; amount: number }>;
  }) => Promise<{ message: string; paid: number; total: number }>;
};

const emptyWallet: Wallet = {
  balance: 0,
  available: 0,
  pending: 0,
  currency: 'USD',
  lastUpdated: new Date().toISOString(),
  lifetimeRevenue: 0,
  lifetimePayouts: 0,
};

function mapWallet(balance: number, updatedAt?: string): Wallet {
  return {
    balance,
    available: balance,
    pending: 0,
    currency: 'USD',
    lastUpdated: updatedAt || new Date().toISOString(),
    lifetimeRevenue: balance,
    lifetimePayouts: 0,
  };
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallet: isMockMode ? mapWallet(250) : emptyWallet,
  distributions: [],
  transactions: [],
  attempts: [],
  paymentAccount: null,
  hydrated: false,
  loading: false,
  fetchWallet: async () => {
    if (isMockMode) {
      set({ hydrated: true, loading: false });
      return;
    }
    set({ loading: true });
    try {
      const [{ wallet, distributions }, { transactions }, accountRes] =
        await Promise.all([
          walletApi.get(),
          walletApi.transactions(),
          walletApi.account().catch(() => ({ connected: false, account: null })),
        ]);
      set({
        wallet: mapWallet(wallet.balance, wallet.updatedAt),
        distributions: distributions.map((d) => ({
          id: d.id,
          recipient: d.guestName,
          role: 'Guest',
          amount: d.amount,
          percent: 0,
          status: d.status === 'sent' ? ('paid' as const) : ('pending' as const),
          eventId: '',
        })),
        transactions: transactions.map((t) => ({
          id: t.id,
          title: t.note || t.type,
          amount: t.amount,
          type: t.type === 'debit' ? 'debit' : 'credit',
          category: 'Wallet',
          date: t.createdAt,
          status: 'completed',
        })),
        paymentAccount:
          accountRes.connected && accountRes.account
            ? {
                provider: accountRes.account.provider,
                accountNumber: accountRes.account.accountNumber,
                connectedAt: accountRes.account.connectedAt,
              }
            : null,
        hydrated: true,
        loading: false,
      });
    } catch (e) {
      set({ loading: false, hydrated: true });
      throw e;
    }
  },
  getDistribution: (id) => get().distributions.find((d) => d.id === id),
  getAttempt: (id) => get().attempts.find((a) => a.id === id),
  confirmPayment: async (distributionId, options) => {
    const item = get().distributions.find((d) => d.id === distributionId);
    if (!item) return null;

    if (isMockMode) {
      const fail = Boolean(options?.forceFail);
      const balance = get().wallet.balance;
      if (!fail && balance < item.amount) {
        const attempt: WalletPaymentAttempt = {
          id: `pay-${Date.now()}`,
          distributionId: item.id,
          recipient: item.recipient,
          role: item.role,
          amount: item.amount,
          status: 'failed',
          createdAt: new Date().toISOString(),
          reference: `PAY-FAIL-${Date.now().toString().slice(-8)}`,
          failureReason: 'Balance kuma filna.',
        };
        set((state) => ({ attempts: [attempt, ...state.attempts] }));
        return attempt;
      }
      const attempt: WalletPaymentAttempt = {
        id: `pay-${Date.now()}`,
        distributionId: item.id,
        recipient: item.recipient,
        role: item.role,
        amount: item.amount,
        status: fail ? 'failed' : 'success',
        createdAt: new Date().toISOString(),
        reference: `PAY-${Date.now().toString().slice(-8)}`,
        failureReason: fail ? 'Mock payment failed' : undefined,
      };
      set((state) => ({
        attempts: [attempt, ...state.attempts],
        wallet: fail
          ? state.wallet
          : mapWallet(state.wallet.balance - item.amount),
        distributions: fail
          ? state.distributions
          : state.distributions.map((d) =>
              d.id === distributionId ? { ...d, status: 'paid' as const } : d,
            ),
        transactions: fail
          ? state.transactions
          : [
              {
                id: `txn-${Date.now()}`,
                title: `Payout · ${item.recipient}`,
                amount: item.amount,
                type: 'debit' as const,
                category: 'Wallet',
                date: new Date().toISOString(),
                status: 'completed' as const,
              },
              ...state.transactions,
            ],
      }));
      return attempt;
    }

    try {
      const res = await walletApi.payout(distributionId, {
        forceFail: options?.forceFail,
      });
      const attempt: WalletPaymentAttempt = {
        id: `pay-${Date.now()}`,
        distributionId: item.id,
        recipient: res.attempt?.recipient ?? item.recipient,
        role: item.role,
        amount: res.attempt?.amount ?? item.amount,
        status: res.status === 'success' ? 'success' : 'failed',
        createdAt: new Date().toISOString(),
        reference:
          res.attempt?.reference ??
          `PAY-${Date.now().toString().slice(-8)}`,
        failureReason:
          res.status === 'failed'
            ? res.failureReason || res.message || 'Payment failed'
            : undefined,
      };
      set((state) => ({
        attempts: [attempt, ...state.attempts],
        wallet: mapWallet(res.wallet.balance),
        distributions:
          res.status === 'success'
            ? state.distributions.map((d) =>
                d.id === distributionId ? { ...d, status: 'paid' as const } : d,
              )
            : state.distributions,
      }));
      await get().fetchWallet();
      return attempt;
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Payment wuu fashilmay.';
      const attempt: WalletPaymentAttempt = {
        id: `pay-${Date.now()}`,
        distributionId: item.id,
        recipient: item.recipient,
        role: item.role,
        amount: item.amount,
        status: 'failed',
        createdAt: new Date().toISOString(),
        reference: `PAY-FAIL-${Date.now().toString().slice(-8)}`,
        failureReason: message,
      };
      set((state) => ({ attempts: [attempt, ...state.attempts] }));
      await get().fetchWallet().catch(() => undefined);
      return attempt;
    }
  },
  distributeAll: async () => {
    if (isMockMode) {
      return 'Mock: distributions ready.';
    }
    const res = await walletApi.distribute();
    await get().fetchWallet();
    return res.message;
  },
  connectAccount: async (input) => {
    if (isMockMode) {
      const granted = get().paymentAccount ? 0 : 250;
      const balance = get().paymentAccount
        ? get().wallet.balance
        : Math.max(get().wallet.balance, 250);
      set({
        paymentAccount: {
          provider: input.provider,
          accountNumber: input.accountNumber,
          connectedAt: new Date().toISOString(),
        },
        wallet: mapWallet(balance),
      });
      return {
        message: granted
          ? `Mock: account connected. $${granted} ayaa lagu daray.`
          : 'Mock: account already connected.',
        granted,
      };
    }
    const res = await walletApi.connect(input);
    set({
      paymentAccount: {
        provider: res.account.provider,
        accountNumber: res.account.accountNumber,
        connectedAt: res.account.connectedAt,
      },
      wallet: mapWallet(res.wallet.balance),
    });
    await get().fetchWallet();
    return { message: res.message, granted: res.granted };
  },
  purchaseTicket: async (input) => {
    if (isMockMode) {
      const amount = Number(input.amount) || 0;
      if (amount <= 0) {
        return { ok: true, message: 'Free ticket (mock).', free: true };
      }
      if (get().wallet.balance < amount) {
        return { ok: false, message: 'Balance kuma filna.' };
      }
      set((state) => ({
        wallet: mapWallet(state.wallet.balance - amount),
        transactions: [
          {
            id: `txn-${Date.now()}`,
            title: `Ticket · ${input.eventTitle}`,
            amount,
            type: 'debit',
            category: 'Tickets',
            date: new Date().toISOString(),
            status: 'completed',
          },
          ...state.transactions,
        ],
      }));
      return { ok: true, message: 'Ticket mock ayaa la iibsaday.' };
    }
    try {
      const res = await walletApi.purchaseTicket(input);
      set({ wallet: mapWallet(res.wallet.balance) });
      await get().fetchWallet();
      return {
        ok: res.ok && res.status === 'success',
        message: res.message || 'Ticket waa la helay.',
        free: res.free,
      };
    } catch (e) {
      await get().fetchWallet().catch(() => undefined);
      return {
        ok: false,
        message:
          e instanceof Error
            ? e.message
            : 'Iibsashada ticket-ka way fashilantay.',
      };
    }
  },
  payGuests: async (input) => {
    if (isMockMode) {
      const payments = input.payments || [];
      const total = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      if (total > 0 && get().wallet.balance < total) {
        throw new Error('Balance kuma filna.');
      }
      set((state) => ({
        wallet: mapWallet(Math.max(0, state.wallet.balance - total)),
        transactions:
          total > 0
            ? [
                {
                  id: `txn-${Date.now()}`,
                  title: 'Pay guests (mock)',
                  amount: total,
                  type: 'debit' as const,
                  category: 'Guests',
                  date: new Date().toISOString(),
                  status: 'completed' as const,
                },
                ...state.transactions,
              ]
            : state.transactions,
      }));
      return {
        message: `${payments.length} marti mock ayaa la bixiyay.`,
        paid: payments.length,
        total,
      };
    }
    const res = await walletApi.payGuests(input);
    set({ wallet: mapWallet(res.wallet.balance) });
    await get().fetchWallet();
    return {
      message: res.message,
      paid: res.paid,
      total: res.total,
    };
  },
}));
