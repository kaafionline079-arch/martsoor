import { create } from 'zustand';
import { walletApi } from '@/api';
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
  wallet: emptyWallet,
  distributions: [],
  transactions: [],
  attempts: [],
  paymentAccount: null,
  hydrated: false,
  loading: false,
  fetchWallet: async () => {
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
        paymentAccount: accountRes.connected && accountRes.account
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
    const res = await walletApi.distribute();
    await get().fetchWallet();
    return res.message;
  },
  connectAccount: async (input) => {
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
