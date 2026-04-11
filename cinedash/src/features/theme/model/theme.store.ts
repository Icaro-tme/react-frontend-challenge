import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark'

interface ThemeState {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light'
  }

  // aqui eu pego a preferência do sistema só no primeiro carregamento.
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: getInitialTheme(),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => {
        const nextTheme = get().theme === 'light' ? 'dark' : 'light'

        set({ theme: nextTheme })
      },
    }),
    {
      name: 'cinedash-theme-store',
      // esse persist salva o tema no localstorage pra não resetar no refresh.
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
      }),
    },
  ),
)

export function applyTheme(theme: ThemeMode): void {
  if (typeof document === 'undefined') {
    return
  }

  // essa classe 'dark' é o gatilho que o tailwind usa pra trocar as variantes.
  document.documentElement.classList.toggle('dark', theme === 'dark')
}
