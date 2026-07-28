import { api } from './client';

export const walletApi = {
  get: () =>
    api<{
      wallet: { balance: number; currency: string; updatedAt?: string };
      distributions: Array<{
        id: string;
        guestName: string;
        amount: number;
        status: string;
        createdAt: string;
      }>;
    }>('/wallet'),
  transactions: () =>
    api<{
      transactions: Array<{
        id: string;
        amount: number;
        type: string;
        note: string;
        createdAt: string;
      }>;
    }>('/wallet/transactions'),
  distribute: () =>
    api<{
      ok: boolean;
      message?: string;
      wallet: { balance: number; currency: string };
      distributed: number;
    }>('/wallet/distribute', { method: 'POST', body: {} }),
  connect: (input: {
    provider: 'salaam' | 'merchant';
    accountNumber: string;
  }) =>
    api<{
      ok: boolean;
      message: string;
      granted: number;
      account: {
        provider: string;
        accountNumber: string;
        connectedAt: string;
      };
      wallet: { balance: number; currency: string };
    }>('/wallet/connect', { method: 'POST', body: input }),
  account: () =>
    api<{
      connected: boolean;
      account: {
        provider: string;
        accountNumber: string;
        connectedAt: string;
      } | null;
    }>('/wallet/account'),
  debit: (amount: number, note: string) =>
    api<{
      ok: boolean;
      message?: string;
      wallet: { balance: number; currency: string };
    }>('/wallet/debit', { method: 'POST', body: { amount, note } }),
  refund: (amount: number, note: string) =>
    api<{
      ok: boolean;
      message?: string;
      wallet: { balance: number; currency: string };
    }>('/wallet/refund', { method: 'POST', body: { amount, note } }),
  payout: (distributionId: string, options?: { forceFail?: boolean }) =>
    api<{
      ok: boolean;
      status: 'success' | 'failed';
      message?: string;
      failureReason?: string;
      wallet: { balance: number; currency: string };
      attempt?: {
        distributionId: string;
        recipient: string;
        amount: number;
        reference: string;
      };
    }>('/wallet/payout', {
      method: 'POST',
      body: { distributionId, forceFail: options?.forceFail ?? false },
    }),
  purchaseTicket: (input: {
    amount: number;
    eventTitle: string;
    forceFail?: boolean;
  }) =>
    api<{
      ok: boolean;
      status: 'success' | 'failed';
      free?: boolean;
      message?: string;
      wallet: { balance: number; currency: string };
    }>('/wallet/purchase-ticket', { method: 'POST', body: input }),
  payGuests: (input: {
    eventId: string;
    payments?: Array<{ guestId: string; amount: number }>;
  }) =>
    api<{
      ok: boolean;
      paid: number;
      total: number;
      message: string;
      wallet: { balance: number; currency: string };
    }>('/wallet/pay-guests', { method: 'POST', body: input }),
};
