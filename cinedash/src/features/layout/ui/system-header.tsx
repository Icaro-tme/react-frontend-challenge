import { useTranslation } from 'react-i18next'
import {
  FaArrowRightFromBracket,
  FaGlobe,
  FaMoon,
  FaSun,
} from 'react-icons/fa6'
import type { RouteLanguage } from '../../../shared/config/language'

interface SystemHeaderProps {
  title: string
  subtitle: string
  theme: 'light' | 'dark'
  routeLanguage: RouteLanguage
  onToggleTheme: () => void
  onToggleLanguage: () => void | Promise<void>
  onSignOut: () => void
}

export function SystemHeader({
  title,
  subtitle,
  theme,
  routeLanguage,
  onToggleTheme,
  onToggleLanguage,
  onSignOut,
}: SystemHeaderProps) {
  const { t } = useTranslation()

  const tooltipTema =
    theme === 'dark'
      ? t('rodape.alternarTemaClaro')
      : t('rodape.alternarTemaEscuro')

  return (
    <header className="border-b border-slate-300/70 bg-slate-900/95 text-slate-100 backdrop-blur dark:border-slate-700 dark:bg-slate-950/95">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-8">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold md:text-xl">{title}</h1>
          <p className="mt-1 text-xs text-slate-300 md:text-sm">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-500/70 bg-slate-800/70 px-3 py-2 text-slate-100 transition hover:border-cyan-300 hover:text-cyan-100"
            title={t('rodape.trocarIdioma')}
            aria-label={t('rodape.trocarIdioma')}
            onClick={() => {
              void onToggleLanguage()
            }}
          >
            <FaGlobe size={14} />
            <span className="text-xs font-semibold uppercase tracking-[0.12em]">
              {routeLanguage}
            </span>
          </button>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-500/70 bg-slate-800/70 text-slate-100 transition hover:border-amber-300 hover:text-amber-100"
            title={tooltipTema}
            aria-label={tooltipTema}
            onClick={onToggleTheme}
          >
            {theme === 'dark' ? <FaSun size={15} /> : <FaMoon size={15} />}
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-500/70 bg-slate-800/70 px-3 py-2 text-slate-100 transition hover:border-rose-300 hover:text-rose-100"
            onClick={onSignOut}
          >
            <FaArrowRightFromBracket size={14} />
            <span className="hidden text-xs font-semibold uppercase tracking-[0.12em] sm:inline">
              {t('acoes.sair')}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}