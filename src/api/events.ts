import { api } from './client';
import type { EventItem } from '@/types';
import type { EventDraft } from '@/store/eventStore';

export const eventsApi = {
  list: () => api<{ events: EventItem[] }>('/events'),
  get: (id: string) => api<{ event: EventItem }>(`/events/${id}`),
  create: (draft: EventDraft) =>
    api<{ event: EventItem }>('/events', { method: 'POST', body: draft }),
  update: (id: string, patch: Partial<EventItem>) =>
    api<{ event: EventItem }>(`/events/${id}`, { method: 'PATCH', body: patch }),
  remove: (id: string) =>
    api<{ ok: boolean }>(`/events/${id}`, { method: 'DELETE' }),
};
