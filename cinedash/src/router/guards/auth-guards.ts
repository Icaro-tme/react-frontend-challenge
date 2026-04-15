import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '../../features/auth/model/auth.store'
import type { RouteLanguage } from '../../shared/config/language'

export function redirectIfLogged(routeLanguage: RouteLanguage): void {
  const canUseSystem = useAuthStore.getState().canUseSystem()

  if (!canUseSystem) {
    return
  }

  throw redirect({
    to: '/$lang/dashboard',
    params: {
      lang: routeLanguage,
    },
  })
}

export function requireLogged(routeLanguage: RouteLanguage): void {
  const canUseSystem = useAuthStore.getState().canUseSystem()

  if (canUseSystem) {
    return
  }

  throw redirect({
    to: '/$lang/session-required',
    params: {
      lang: routeLanguage,
    },
  })
}

export function redirectFromLanguageIndex(routeLanguage: RouteLanguage): void {
  const canUseSystem = useAuthStore.getState().canUseSystem()

  throw redirect({
    to: canUseSystem ? '/$lang/dashboard' : '/$lang/login',
    params: {
      lang: routeLanguage,
    },
  })
}
