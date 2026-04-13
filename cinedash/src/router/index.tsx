import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  redirect,
} from '@tanstack/react-router'
import { useAuthStore } from '../features/auth/model/auth.store'
import { getPreferredRouteLanguage } from '../features/locale/model/locale.store'
import { NotFoundPage } from '../pages/not-found-page'
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

const loginPageComponent = lazyRouteComponent(
  () => import('../pages/login-page'),
  'LoginPage',
)
const signupPageComponent = lazyRouteComponent(
  () => import('../pages/signup-page'),
  'SignupPage',
)
const sessionRequiredPageComponent = lazyRouteComponent(
  () => import('../pages/session-required-page'),
  'SessionRequiredPage',
)
const dashboardPageComponent = lazyRouteComponent(
  () => import('../pages/dashboard-page'),
  'DashboardPage',
)
const setlistPageComponent = lazyRouteComponent(
  () => import('../pages/setlist-page'),
  'SetlistPage',
)
const watchlistPageComponent = lazyRouteComponent(
  () => import('../pages/watchlist-page'),
  'WatchlistPage',
)
const movieDetailsPageComponent = lazyRouteComponent(
  () => import('../pages/movie-details-page'),
  'MovieDetailsPage',
)

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
  component: loginPageComponent,
})

const signupRoute = createRoute({
  getParentRoute: () => languageRoute,
  path: 'signup',
  beforeLoad: ({ params }) => {
    const routeLanguage = getRouteLanguageParam(params)

    redirectIfLogged(routeLanguage)
  },
  component: signupPageComponent,
})

const sessionRequiredRoute = createRoute({
  getParentRoute: () => languageRoute,
  path: 'session-required',
  beforeLoad: ({ params }) => {
    const routeLanguage = getRouteLanguageParam(params)

    redirectIfLogged(routeLanguage)
  },
  component: sessionRequiredPageComponent,
})

const dashboardRoute = createRoute({
  getParentRoute: () => languageRoute,
  path: 'dashboard',
  beforeLoad: ({ params }) => {
    const routeLanguage = getRouteLanguageParam(params)

    requireLogged(routeLanguage)
  },
  component: dashboardPageComponent,
})

const setlistRoute = createRoute({
  getParentRoute: () => languageRoute,
  path: 'setlist',
  beforeLoad: ({ params }) => {
    const routeLanguage = getRouteLanguageParam(params)

    requireLogged(routeLanguage)
  },
  component: setlistPageComponent,
})

const watchlistRoute = createRoute({
  getParentRoute: () => languageRoute,
  path: 'watchlist',
  beforeLoad: ({ params }) => {
    const routeLanguage = getRouteLanguageParam(params)

    requireLogged(routeLanguage)
  },
  component: watchlistPageComponent,
})

const movieDetailsRoute = createRoute({
  getParentRoute: () => languageRoute,
  path: 'movie/$movieId',
  beforeLoad: ({ params }) => {
    const routeLanguage = getRouteLanguageParam(params)

    requireLogged(routeLanguage)
  },
  component: movieDetailsPageComponent,
})

const routeTree = rootRoute.addChildren([
  rootIndexRoute,
  languageRoute.addChildren([
    languageIndexRoute,
    loginRoute,
    signupRoute,
    sessionRequiredRoute,
    dashboardRoute,
    setlistRoute,
    watchlistRoute,
    movieDetailsRoute,
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
