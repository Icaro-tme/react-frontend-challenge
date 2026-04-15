import { redirect } from '@tanstack/react-router'
import { getPreferredRouteLanguage, useLocaleStore } from '../../features/locale/model/locale.store'
import i18n from '../../shared/config/i18n'
import {
  routeLanguageToLocale,
  SUPPORTED_ROUTE_LANGUAGES,
  type RouteLanguage,
} from '../../shared/config/language'

function findRouteLanguage(valor: string): RouteLanguage | null {
  const idiomaNormalizado = valor.toLowerCase()

  return (
    SUPPORTED_ROUTE_LANGUAGES.find(
      (idioma) => idioma.toLowerCase() === idiomaNormalizado,
    ) ?? null
  )
}

export async function validateAndSyncRouteLanguage(
  routeLanguageParam: string,
): Promise<RouteLanguage> {
  const routeLanguageValido = findRouteLanguage(routeLanguageParam)

  if (!routeLanguageValido) {
    const routeLanguagePreferido = getPreferredRouteLanguage()

    throw redirect({
      to: '/$lang/login',
      params: {
        lang: routeLanguagePreferido,
      },
    })
  }

  useLocaleStore.getState().setRouteLanguage(routeLanguageValido)

  await i18n.changeLanguage(routeLanguageToLocale(routeLanguageValido))

  return routeLanguageValido
}
