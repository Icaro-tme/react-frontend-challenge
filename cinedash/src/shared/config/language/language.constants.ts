import type { LocaleCode, RouteLanguage } from './language.types'
import { appSettings } from '../app-settings'

export const SUPPORTED_ROUTE_LANGUAGES =
  appSettings.idioma.idiomasSuportados satisfies readonly RouteLanguage[]

export const SUPPORTED_LOCALES =
  SUPPORTED_ROUTE_LANGUAGES satisfies readonly LocaleCode[]
