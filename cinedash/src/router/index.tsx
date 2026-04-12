import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import { useAuthStore } from '../features/auth/model/auth.store'
import { getPreferredRouteLanguage } from '../features/locale/model/locale.store'
import { DashboardPage } from '../pages/dashboard-page'
import { LoginPage } from '../pages/login-page'
import { NotFoundPage } from '../pages/not-found-page'
import { SignupPage } from '../pages/signup-page'
import type { RouteLanguage } from '../shared/config/language'
import {
  redirectFromLanguageIndex,
  redirectIfLogged,
  requireLogged,
} from './guards/auth-guards'
import { validateAndSyncRouteLanguage } from './guards/locale-guards'
import { RootLayout } from './root-layout'

function getRouteLanguageParam(params: { lang: string }): RouteLanguage {
  return params.lang as RouteLanguage
}

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
})

const rootIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const routeLanguage = getPreferredRouteLanguage()
    const canUseSystem = useAuthStore.getState().canUseSystem()

    throw redirect({
      to: canUseSystem ? '/$lang/dashboard' : '/$lang/login',
      params: {
        lang: routeLanguage,
      },
    })
  },
})

const languageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$lang',
  beforeLoad: async ({ params }) => {
    await validateAndSyncRouteLanguage(params.lang)
  },
  component: RootLayout,
})

const languageIndexRoute = createRoute({
  getParentRoute: () => languageRoute,
  path: '/',
  beforeLoad: ({ params }) => {
    const routeLanguage = getRouteLanguageParam(params)

    redirectFromLanguageIndex(routeLanguage)
  },
})

const loginRoute = createRoute({
  getParentRoute: () => languageRoute,
  path: 'login',
  beforeLoad: ({ params }) => {
    const routeLanguage = getRouteLanguageParam(params)

    redirectIfLogged(routeLanguage)
  },
  component: LoginPage,
})

const signupRoute = createRoute({
  getParentRoute: () => languageRoute,
  path: 'signup',
  beforeLoad: ({ params }) => {
    const routeLanguage = getRouteLanguageParam(params)

    redirectIfLogged(routeLanguage)
  },
  component: SignupPage,
})

const dashboardRoute = createRoute({
  getParentRoute: () => languageRoute,
  path: 'dashboard',
  beforeLoad: ({ params }) => {
    const routeLanguage = getRouteLanguageParam(params)

    requireLogged(routeLanguage)
  },
  component: DashboardPage,
})

const routeTree = rootRoute.addChildren([
  rootIndexRoute,
  languageRoute.addChildren([
    languageIndexRoute,
    loginRoute,
    signupRoute,
    dashboardRoute,
  ]),
])

export const router = createRouter({
  routeTree,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
