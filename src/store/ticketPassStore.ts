import { create } from 'zustand';
import { ticketsApi, type ApiTicket } from '@/api/tickets';
import type {
  CheckInResult,
  TicketHistoryEvent,
  TicketHistoryKind,
  TicketPass,
  TicketPassStatus,
} from '@/types';

type ScanOutcome = {
  result: CheckInResult;
  ticket?: TicketPass;
  guestName?: string;
  ticketId?: string;
};

type TicketPassState = {
  passes: TicketPass[];
  history: TicketHistoryEvent[];
  hydrated: boolean;
  loading: boolean;
  fetchPasses: () => Promise<void>;
  getPass: (id: string) => TicketPass | undefined;
  getPassByCode: (code: string) => TicketPass | undefined;
  setStatus: (id: string, status: TicketPassStatus) => void;
  markDownloaded: (id: string) => void;
  checkIn: (rawCode: string) => Promise<ScanOutcome>;
  addFromMarketplace: (input: {
    orderId: string;
    code: string;
    eventId: string;
    eventTitle: string;
    coverImage?: string;
    guestName: string;
    type: string;
    price: number;
    status: TicketPassStatus;
    eventDate?: string;
    eventTime?: string;
    eventLocation?: string;
    pricingMode?: 'free' | 'paid';
  }) => TicketPass;
};

function toPass(ticket: ApiTicket): TicketPass {
  const status: TicketPassStatus =
    ticket.status === 'used'
      ? 'used'
      : ticket.status === 'valid'
        ? 'valid'
        : 'valid';

  return {
    id: ticket.id,
    code: ticket.code,
    qrPayload: ticket.qrPayload || `martisoor:${ticket.code}`,
    eventId: ticket.eventId,
    eventTitle: ticket.eventTitle,
    coverImage: undefined,
    guestName: ticket.guestName,
    type: ticket.type,
    price: ticket.price,
    status,
    purchasedAt: ticket.purchasedAt,
    scannedAt: ticket.checkedInAt,
    source: 'issued',
  };
}

function pushHistory(
  history: TicketHistoryEvent[],
  ticketId: string,
  kind: TicketHistoryKind,
  message: string,
): TicketHistoryEvent[] {
  return [
    {
      id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ticketId,
      kind,
      message,
      at: new Date().toISOString(),
    },
    ...history,
  ];
}

function normalizeCode(raw: string) {
  return raw
    .trim()
    .replace(/^martisoor:/i, '')
    .replace(/^MARTISOOR:\/\/TICKET\//i, '');
}

export const useTicketPassStore = create<TicketPassState>((set, get) => ({
  passes: [],
  history: [],
  hydrated: false,
  loading: false,
  fetchPasses: async () => {
    set({ loading: true });
    try {
      const { tickets } = await ticketsApi.list();
      const passes = tickets.map(toPass);
      set({ passes, hydrated: true, loading: false });
    } catch (e) {
      set({ loading: false, hydrated: true });
      throw e;
    }
  },
  getPass: (id) => get().passes.find((p) => p.id === id),
  getPassByCode: (code) => {
    const normalized = normalizeCode(code).toUpperCase();
    return get().passes.find(
      (p) =>
        p.code.toUpperCase() === normalized ||
        p.qrPayload.toUpperCase().includes(normalized),
    );
  },
  setStatus: (id, status) => {
    set((state) => ({
      passes: state.passes.map((p) => (p.id === id ? { ...p, status } : p)),
    }));
  },
  markDownloaded: (id) => {
    set((state) => ({
      history: pushHistory(
        state.history,
        id,
        'downloaded',
        `Ticket downloaded`,
      ),
    }));
  },
  checkIn: async (rawCode) => {
    const code = normalizeCode(rawCode);
    const res = await ticketsApi.checkIn(code);
    if (res.result === 'success') {
      await get().fetchPasses();
      const ticket = get().passes.find((p) => p.code === res.ticketId);
      set((state) => ({
        history: pushHistory(
          state.history,
          ticket?.id ?? 'unknown',
          'checked_in',
          res.message,
        ),
      }));
      return { result: 'success' as const, ticket, guestName: res.guestName, ticketId: res.ticketId };
    }
    if (res.result === 'already_used') {
      return {
        result: 'already_used' as const,
        guestName: res.guestName,
        ticketId: res.ticketId,
      };
    }
    return { result: 'invalid' as const };
  },
  addFromMarketplace: (input) => {
    const pass: TicketPass = {
      id: `mkt-${input.orderId}`,
      code: input.code,
      qrPayload: `martisoor:${input.code}`,
      eventId: input.eventId,
      eventTitle: input.eventTitle,
      coverImage: input.coverImage,
      guestName: input.guestName,
      type: input.type,
      price: input.price,
      status: input.status,
      purchasedAt: new Date().toISOString(),
      source: 'marketplace',
      eventDate: input.eventDate,
      eventTime: input.eventTime,
      eventLocation: input.eventLocation,
      pricingMode: input.pricingMode ?? (input.price > 0 ? 'paid' : 'free'),
    };
    set((state) => ({
      passes: [pass, ...state.passes],
      history: pushHistory(
        state.history,
        pass.id,
        'status_changed',
        input.price > 0
          ? `Virtual ticket card created (paid)`
          : `Virtual ticket card created (free)`,
      ),
    }));
    return pass;
  },
}));
