import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { RouteLanguage } from '../../../shared/config/language'

export type SystemSectionTab = 'dashboard' | 'setlist' | 'watchlist'

interface SystemSectionTabsProps {
  lang: RouteLanguage
  activeTab: SystemSectionTab
}

interface SectionItem {
  id: SystemSectionTab
  labelKey: string
  to: '/$lang/dashboard' | '/$lang/setlist' | '/$lang/watchlist'
}

const SECTION_ITEMS: SectionItem[] = [
  {
    id: 'dashboard',
    labelKey: 'painel.navegacao.dashboard',
    to: '/$lang/dashboard',
  },
  {
    id: 'setlist',
    labelKey: 'painel.navegacao.setlist',
    to: '/$lang/setlist',
  },
  {
    id: 'watchlist',
    labelKey: 'painel.navegacao.watchlist',
    to: '/$lang/watchlist',
  },
]

export function SystemSectionTabs({ lang, activeTab }: SystemSectionTabsProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <nav className="flex flex-wrap gap-2 mt-4" aria-label={t('painel.navegacao.rotulo')}>
      {SECTION_ITEMS.map((sectionAtual) => {
        const estaAtivo = sectionAtual.id === activeTab

        return (
          <button
            key={sectionAtual.id}
            type="button"
            className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition ${
              estaAtivo
                ? 'border-cyan-400 bg-cyan-600 text-white dark:border-cyan-300 dark:bg-cyan-500'
                : 'border-slate-500/70 bg-slate-800/70 text-slate-100 hover:border-cyan-300 hover:text-cyan-100'
            }`}
            onClick={() => {
              void navigate({
                to: sectionAtual.to,
                params: {
                  lang,
                },
              })
            }}
          >
            {t(sectionAtual.labelKey)}
          </button>
        )
      })}
    </nav>
  )
}
