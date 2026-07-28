import { api } from './client';
import type { Guest } from '@/types';
import type { GuestDraft } from '@/store/guestStore';

export const guestsApi = {
  list: (eventId?: string) =>
    api<{ guests: Guest[] }>(
      eventId ? `/guests?eventId=${encodeURIComponent(eventId)}` : '/guests',
    ),
  create: (eventId: string, draft: GuestDraft) =>
    api<{ guest: Guest }>(`/events/${eventId}/guests`, {
      method: 'POST',
      body: draft,
    }),
  update: (id: string, patch: Partial<Guest> & { invitationChannel?: string }) =>
    api<{ guest: Guest }>(`/guests/${id}`, { method: 'PATCH', body: patch }),
  remove: (id: string) =>
    api<{ ok: boolean }>(`/guests/${id}`, { method: 'DELETE' }),
  invite: (id: string, channel: 'whatsapp' | 'sms') =>
    api<{
      guest: Guest;
      channel: 'whatsapp' | 'sms';
      inviteText: string;
      message: string;
    }>(`/guests/${id}/invite`, {
      method: 'POST',
      body: { channel },
    }),
  inviteAll: (eventId: string, channel: 'whatsapp' | 'sms') =>
    api<{
      ok: boolean;
      sent: number;
      channel: string;
      message: string;
    }>(`/events/${eventId}/invite-all`, {
      method: 'POST',
      body: { channel },
    }),
};
