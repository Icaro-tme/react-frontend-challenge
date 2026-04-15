import { useRouter } from '@tanstack/react-router'
import { useCallback } from 'react'
import type { RouteLanguage } from '../../../shared/config/language'
import { useLocaleStore } from '../model/locale.store'

const LANGUAGE_PREFIX_PATTERN = /^\/(pt-BR|en-US)(?=\/|$)/i

function replaceRouteLanguagePrefix(
  pathname: string,
  nextRouteLanguage: RouteLanguage,
): string {
  if (LANGUAGE_PREFIX_PATTERN.test(pathname)) {
    return pathname.replace(LANGUAGE_PREFIX_PATTERN, `/${nextRouteLanguage}`)
  }

  if (!pathname.startsWith('/')) {
    return `/${nextRouteLanguage}/${pathname}`
  }

  return `/${nextRouteLanguage}${pathname}`
}

export function useLanguageSwitcher() {
  const router = useRouter()
  const routeLanguage = useLocaleStore((state) => state.routeLanguage)

  const toggleLanguage = useCallback(async () => {
    const nextRouteLanguage = routeLanguage === 'pt-BR' ? 'en-US' : 'pt-BR'

    if (typeof window === 'undefined') {
      return
    }

    const nextPathname = replaceRouteLanguagePrefix(
      window.location.pathname,
      nextRouteLanguage,
    )

    router.history.push(
      `${nextPathname}${window.location.search}${window.location.hash}`,
    )
  }, [routeLanguage, router])

  return {
    routeLanguage,
    toggleLanguage,
  }
}
