import { APP_CONFIG } from '@/constants/config';
import type { User } from '@/types';

export const isMockMode =
  APP_CONFIG.authMode === 'mock' || APP_CONFIG.dataMode === 'mock';

/** Demo account for offline / mock builds (no Render required). */
export const MOCK_AUTH = {
  email: 'moahamed@gmail.com',
  password: 'moahmed@55',
  phone: '6657656',
  name: 'Mohamed',
} as const;

export const MOCK_USER: User = {
  id: 'usr-mock-001',
  name: MOCK_AUTH.name,
  email: MOCK_AUTH.email,
  phone: MOCK_AUTH.phone,
  avatar: '',
  memberSince: new Date().toISOString().slice(0, 10),
  address: {
    line1: '',
    city: 'Mogadishu',
    country: 'Somalia',
  },
};

export const MOCK_TOKEN = 'mock-token-martisoor';
