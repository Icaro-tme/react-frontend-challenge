import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  getNavigatorLocale,
  localeToRouteLanguage,
  routeLanguageToLocale,
  type LocaleCode,
  type RouteLanguage,
} from '../../../shared/config/language'

interface LocaleState {
  locale: LocaleCode
  routeLanguage: RouteLanguage
  setRouteLanguage: (routeLanguage: RouteLanguage) => void
  toggleRouteLanguage: () => RouteLanguage
}

const initialLocale = getNavigatorLocale()

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: initialLocale,
      routeLanguage: localeToRouteLanguage(initialLocale),
      setRouteLanguage: (routeLanguage) =>
        set({
          routeLanguage,
          locale: routeLanguageToLocale(routeLanguage),
        }),
      toggleRouteLanguage: () => {
        const nextRouteLanguage =
          get().routeLanguage === 'pt-BR' ? 'en-US' : 'pt-BR'

        set({
          routeLanguage: nextRouteLanguage,
          locale: routeLanguageToLocale(nextRouteLanguage),
        })

        return nextRouteLanguage
      },
    }),
    {
      name: 'cinedash-locale-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        locale: state.locale,
        routeLanguage: state.routeLanguage,
      }),
    },
  ),
)

export function getPreferredRouteLanguage(): RouteLanguage {
  return useLocaleStore.getState().routeLanguage
}
