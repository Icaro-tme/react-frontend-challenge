import { QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { ToastProvider } from '../shared/ui/toast/toast-provider'
import { queryClient } from './query-client'
import { ThemeSyncProvider } from './theme-sync-provider'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSyncProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeSyncProvider>
    </QueryClientProvider>
  )
}
