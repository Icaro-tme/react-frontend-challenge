import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { RouteLanguage } from '../../../shared/config/language'
import { SystemFooter } from './system-footer'
import { SystemHeader } from './system-header'
import { SystemSectionTabs, type SystemSectionTab } from './system-section-tabs'

interface SystemPageShellProps {
  lang: RouteLanguage
  activeTab: SystemSectionTab
  theme: 'light' | 'dark'
  routeLanguage: RouteLanguage
  onToggleTheme: () => void
  onToggleLanguage: () => void | Promise<void>
  onSignOut: () => void | Promise<void>
  children: ReactNode
  topContent?: ReactNode
  afterMainContent?: ReactNode
}

export function SystemPageShell({
  lang,
  activeTab,
  theme,
  routeLanguage,
  onToggleTheme,
  onToggleLanguage,
  onSignOut,
  children,
  topContent,
  afterMainContent,
}: SystemPageShellProps) {
  const { t } = useTranslation()

  return (
    <main className="flex min-h-screen flex-col">
      <SystemHeader
        title={t('painel.titulo')}
        subtitle={t('painel.descricao')}
        theme={theme}
        routeLanguage={routeLanguage}
        onToggleTheme={onToggleTheme}
        onToggleLanguage={onToggleLanguage}
        onSignOut={onSignOut}
      />

      <section className="mx-auto w-full max-w-[1440px] flex-1 px-3 py-4 md:px-8 md:py-8">
        <SystemSectionTabs lang={lang} activeTab={activeTab} />

        {topContent}

        {children}
      </section>

      {afterMainContent}

      <SystemFooter />
    </main>
  )
}
