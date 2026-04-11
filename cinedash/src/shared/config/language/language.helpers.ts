import type { LocaleCode, RouteLanguage } from './language.types'
import { appSettings } from '../app-settings'

export function routeLanguageToLocale(routeLanguage: RouteLanguage): LocaleCode {
  return routeLanguage
}

export function localeToRouteLanguage(locale: LocaleCode): RouteLanguage {
  return locale
}

export function getNavigatorLocale(): LocaleCode {
  if (typeof window === 'undefined') {
    return appSettings.idioma.idiomaPadrao
  }

  return window.navigator.language.toLowerCase().startsWith('en')
    ? 'en-US'
    : appSettings.idioma.idiomaPadrao
}
