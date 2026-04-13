import { useNavigate, useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthFooter } from '../features/auth/ui/auth-footer'
import { useLanguageSwitcher } from '../features/locale/hooks/use-language-switcher'
import { useThemeStore } from '../features/theme/model/theme.store'
import { appSettings } from '../shared/config/app-settings'
import type { RouteLanguage } from '../shared/config/language'
import { wait } from '../shared/lib/wait'

function SessionRequiredSkeleton() {
  return (
    <section className="surface-card animate-pulse">
      <div className="w-56 h-6 rounded bg-amber-200/80 dark:bg-amber-800/40" />
      <div className="w-full h-5 mt-6 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="w-4/5 h-5 mt-2 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="w-40 mt-8 h-11 rounded-xl bg-slate-200 dark:bg-slate-700" />
    </section>
  )
}

export function SessionRequiredPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { lang } = useParams({ strict: false }) as { lang: RouteLanguage }

  const tema = useThemeStore((state) => state.theme)
  const alternarTema = useThemeStore((state) => state.toggleTheme)
  const { routeLanguage, toggleLanguage } = useLanguageSwitcher()

  const [estaCarregando, setEstaCarregando] = useState(true)

  useEffect(() => {
    let ativo = true

    void wait(appSettings.auth.tempoDelayMockMs).then(() => {
      if (!ativo) {
        return
      }

      setEstaCarregando(false)
    })

    return () => {
      ativo = false
    }
  }, [])

  return (
    <main className="auth-page-shell">
      <div className="auth-page-stack">
        {estaCarregando ? (
          <SessionRequiredSkeleton />
        ) : (
          <section className="surface-card">
            <span className="badge-chip badge-chip--amber">
              {t('sessao.verificandoSessao')}
            </span>

            <p className="text-2xl card-title text-rose-700 dark:text-rose-300">
              {t('sessao.erroSemSessaoAtiva')}
            </p>

            <button
              type="button"
              className="mt-8 btn btn--slate"
              onClick={() => {
                void navigate({
                  to: '/$lang/login',
                  params: {
                    lang,
                  },
                })
              }}
            >
              {t('sessao.irParaLogin')}
            </button>
          </section>
        )}

        <AuthFooter
          theme={tema}
          onToggleTheme={alternarTema}
          routeLanguage={routeLanguage}
          onToggleLanguage={toggleLanguage}
        />
      </div>
    </main>
  )
}
