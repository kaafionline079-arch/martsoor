import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeMode } from '@/theme';

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      setMode: (mode) => set({ mode }),
      toggle: () => {
        const current = get().mode;
        if (current === 'system') {
          set({ mode: 'light' });
          return;
        }
        set({ mode: current === 'light' ? 'dark' : 'light' });
      },
    }),
    {
      name: 'martisoor-theme',
      storage: createJSONStorage(() => AsyncStorage),
      // Prefer light UI so white screens keep dark readable text.
      partialize: (state) => ({
        mode: state.mode === 'system' ? 'light' : state.mode,
      }),
    },
  ),
);
