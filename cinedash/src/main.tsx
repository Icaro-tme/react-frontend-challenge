import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './shared/ui/base.css'
import './shared/ui/components.css'
import './features/auth/ui/auth-page.css'
import './shared/config/i18n'
import { AppProviders } from './providers/app-providers'
import { router } from './router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
)
