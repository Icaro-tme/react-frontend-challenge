import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { getPreferredRouteLanguage } from '../features/locale/model/locale.store'

export function NotFoundPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <main className="auth-page-shell">
      <section className="surface-card">
        <h1 className="card-title">{t('naoEncontrado.titulo')}</h1>
        <p className="card-description">{t('naoEncontrado.descricao')}</p>

        <button
          type="button"
          className="btn btn--slate mt-6"
          onClick={() => {
            const routeLanguage = getPreferredRouteLanguage()

            void navigate({
              to: '/$lang/login',
              params: {
                lang: routeLanguage,
              },
            })
          }}
        >
          {t('acoes.fechar')}
        </button>
      </section>
    </main>
  )
}
