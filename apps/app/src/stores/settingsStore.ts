import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LangCode } from '@/lib/constants';

interface SettingsState {
  language: LangCode;
  darkMode: boolean;
  soundEnabled: boolean;
  setLanguage: (lang: LangCode) => void;
  toggleDarkMode: () => void;
  toggleSound: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'uz',
      darkMode: false,
      soundEnabled: true,

      setLanguage: (language) => set({ language }),

      toggleDarkMode: () =>
        set((state) => {
          const darkMode = !state.darkMode;
          if (darkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { darkMode };
        }),

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
    }),
    { name: 'osonprava-settings' },
  ),
);
