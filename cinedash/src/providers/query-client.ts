import { QueryClient } from '@tanstack/react-query'
import { appSettings } from '../shared/config/app-settings'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: appSettings.query.staleTimeMs,
      gcTime: appSettings.query.gcTimeMs,
      refetchOnWindowFocus: false,
      retry: appSettings.query.retryQueries,
    },
    mutations: {
      retry: appSettings.query.retryMutations,
    },
  },
})
