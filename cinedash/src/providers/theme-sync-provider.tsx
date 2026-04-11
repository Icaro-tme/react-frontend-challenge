import { type ReactNode, useEffect } from 'react'
import { applyTheme, useThemeStore } from '../features/theme/model/theme.store'

interface ThemeSyncProviderProps {
  children: ReactNode
}

export function ThemeSyncProvider({ children }: ThemeSyncProviderProps) {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return children
}
