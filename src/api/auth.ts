import { api, setToken } from './client';
import type { User } from '@/types';

export type AuthResponse = { token: string; user: User & { locale?: string } };

export const authApi = {
  register: (body: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    locale?: string;
  }) => api<AuthResponse>('/auth/register', { method: 'POST', body, auth: false }),

  login: (body: { email: string; password: string }) =>
    api<AuthResponse>('/auth/login', { method: 'POST', body, auth: false }),

  me: () => api<{ user: User & { locale?: string } }>('/auth/me'),

  updateMe: (body: Partial<{ name: string; phone: string; locale: string }>) =>
    api<{ user: User & { locale?: string } }>('/auth/me', {
      method: 'PATCH',
      body,
    }),

  persistToken: setToken,
};
