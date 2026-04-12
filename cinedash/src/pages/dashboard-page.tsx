import { useNavigate, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { AuthFooter } from '../features/auth/ui/auth-footer'
import { useAuthStore } from '../features/auth/model/auth.store'
import { useThemeStore } from '../features/theme/model/theme.store'
import type { RouteLanguage } from '../shared/config/language'

export function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { lang } = useParams({ strict: false }) as { lang: RouteLanguage }

  const tema = useThemeStore((state) => state.theme)
  const alternarTema = useThemeStore((state) => state.toggleTheme)

  const usuarioLogado = useAuthStore((state) => state.usuarioLogado)
  const canExport = useAuthStore((state) => state.canExport())
  const signOut = useAuthStore((state) => state.signOut)

  return (
    <main className="auth-page-shell">
      <div className="auth-page-stack">
        <section className="surface-card">
          <span className="badge-chip badge-chip--slate">Dashboard</span>

          <h1 className="card-title">{t('painel.tituloEmConstrucao')}</h1>
          <p className="card-description">
            {t('painel.loginRealizadoPara')} <strong>{usuarioLogado?.email}</strong>
          </p>

          <p className="form-feedback form-feedback--neutral mt-4">
            {t('painel.perfilAtual')}: <strong>{usuarioLogado?.perfil}</strong>
          </p>
          <p className="form-feedback form-feedback--neutral mt-1">
            {t('painel.podeExportar')}:{' '}
            <strong>{canExport ? t('painel.sim') : t('painel.nao')}</strong>
          </p>

          <button
            type="button"
            className="btn btn--slate mt-6"
            onClick={() => {
              signOut()

              void navigate({
                to: '/$lang/login',
                params: {
                  lang,
                },
              })
            }}
          >
            {t('acoes.sair')}
          </button>
        </section>

        <AuthFooter theme={tema} onToggleTheme={alternarTema} />
      </div>
    </main>
  )
}
