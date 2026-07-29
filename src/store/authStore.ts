import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '@/api';
import { AppError } from '@/utils/errors';
import {
  isMockMode,
  MOCK_AUTH,
  MOCK_TOKEN,
  MOCK_USER,
} from '@/constants/mockAuth';
import type { User } from '@/types';

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<User>) => Promise<void>;
  refreshMe: () => Promise<void>;
  setHydrated: (value: boolean) => void;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      hydrated: false,
      login: async (email, password) => {
        if (isMockMode) {
          if (
            normalizeEmail(email) !== normalizeEmail(MOCK_AUTH.email) ||
            password !== MOCK_AUTH.password
          ) {
            throw new AppError(
              `Mock login: isticmaal ${MOCK_AUTH.email} / ${MOCK_AUTH.password}`,
              'INVALID_CREDENTIALS',
            );
          }
          await authApi.persistToken(MOCK_TOKEN);
          set({
            token: MOCK_TOKEN,
            user: MOCK_USER,
            isAuthenticated: true,
          });
          return;
        }
        const { token, user } = await authApi.login({ email, password });
        await authApi.persistToken(token);
        set({ token, user, isAuthenticated: true });
      },
      register: async (name, email, password, phone) => {
        if (name.trim().length < 2) {
          throw new AppError('Enter your full name.', 'INVALID_NAME');
        }
        if (isMockMode) {
          const user: User = {
            ...MOCK_USER,
            id: `usr-mock-${Date.now()}`,
            name: name.trim(),
            email: normalizeEmail(email),
            phone: phone?.trim() || MOCK_AUTH.phone,
          };
          await authApi.persistToken(MOCK_TOKEN);
          set({ token: MOCK_TOKEN, user, isAuthenticated: true });
          return;
        }
        const { token, user } = await authApi.register({
          name,
          email,
          password,
          phone,
        });
        await authApi.persistToken(token);
        set({ token, user, isAuthenticated: true });
      },
      logout: async () => {
        await authApi.persistToken(null);
        set({ token: null, user: null, isAuthenticated: false });
      },
      updateProfile: async (patch) => {
        if (isMockMode) {
          const current = get().user;
          if (!current) return;
          set({
            user: {
              ...current,
              ...patch,
              address: patch.address
                ? { ...current.address, ...patch.address }
                : current.address,
            },
          });
          return;
        }
        const { user } = await authApi.updateMe({
          name: patch.name,
          phone: patch.phone,
        });
        set({ user });
      },
      refreshMe: async () => {
        if (!get().token) return;
        if (isMockMode) {
          set({
            user: get().user || MOCK_USER,
            isAuthenticated: true,
          });
          return;
        }
        try {
          const { user } = await authApi.me();
          set({ user, isAuthenticated: true });
        } catch {
          await authApi.persistToken(null);
          set({ token: null, user: null, isAuthenticated: false });
        }
      },
      setHydrated: (value) => set({ isHydrated: value, hydrated: value }),
    }),
    {
      name: 'martisoor-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => async (state) => {
        if (isMockMode) {
          if (state?.token) {
            await authApi.persistToken(state.token);
            useAuthStore.setState({
              user: state.user || MOCK_USER,
              isAuthenticated: true,
              isHydrated: true,
              hydrated: true,
            });
            return;
          }
          useAuthStore.setState({ isHydrated: true, hydrated: true });
          return;
        }
        if (state?.token) {
          await authApi.persistToken(state.token);
          try {
            const { user } = await authApi.me();
            useAuthStore.setState({
              user,
              isAuthenticated: true,
              isHydrated: true,
              hydrated: true,
            });
            return;
          } catch {
            await authApi.persistToken(null);
            useAuthStore.setState({
              token: null,
              user: null,
              isAuthenticated: false,
              isHydrated: true,
              hydrated: true,
            });
            return;
          }
        }
        useAuthStore.setState({ isHydrated: true, hydrated: true });
      },
    },
  ),
);
