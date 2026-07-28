import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '@/api';
import { AppError } from '@/utils/errors';
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      hydrated: false,
      login: async (email, password) => {
        const { token, user } = await authApi.login({ email, password });
        await authApi.persistToken(token);
        set({ token, user, isAuthenticated: true });
      },
      register: async (name, email, password, phone) => {
        if (name.trim().length < 2) {
          throw new AppError('Enter your full name.', 'INVALID_NAME');
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
        const { user } = await authApi.updateMe({
          name: patch.name,
          phone: patch.phone,
        });
        set({ user });
      },
      refreshMe: async () => {
        if (!get().token) return;
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
