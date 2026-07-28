import { api } from './client';

export type ApiTicket = {
  id: string;
  code: string;
  eventId: string;
  eventTitle: string;
  eventDate?: string;
  guestId: string;
  guestName: string;
  type: string;
  price: number;
  status: string;
  purchasedAt: string;
  qrPayload: string;
  checkedInAt?: string;
};

export type CheckInResponse = {
  result: 'success' | 'already_used' | 'not_found';
  message: string;
  guestName?: string;
  ticketId?: string;
  eventTitle?: string;
  checkedInAt?: string;
};

export const ticketsApi = {
  list: () => api<{ tickets: ApiTicket[] }>('/tickets'),
  checkIn: (code: string) =>
    api<CheckInResponse>('/tickets/check-in', {
      method: 'POST',
      body: { code },
    }),
};
