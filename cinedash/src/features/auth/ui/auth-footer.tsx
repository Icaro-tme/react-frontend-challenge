import { useTranslation } from 'react-i18next'
import { useLanguageSwitcher } from '../../locale/hooks/use-language-switcher'
import type { ThemeMode } from '../../theme/model/theme.store'

interface AuthFooterProps {
  theme: ThemeMode
  onToggleTheme: () => void
}

export function AuthFooter({
  theme,
  onToggleTheme,
}: AuthFooterProps) {
  const { t } = useTranslation()
  const { routeLanguage, toggleLanguage } = useLanguageSwitcher()

  return (
    <footer className="surface-footer">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {t('rodape.assinatura')}
      </p>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {t('rodape.contato')}: 
        <a
          href="mailto:icaroabarros@hotmail.com"
          className="font-medium text-cyan-700 underline underline-offset-4 hover:text-cyan-600 dark:text-cyan-300 dark:hover:text-cyan-200"
        >
          icaroabarros@hotmail.com
        </a>
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            void toggleLanguage()
          }}
          className="btn-chip btn-chip--cyan"
        >
          {t('rodape.idioma')}: {routeLanguage}
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          className="btn-chip btn-chip--emerald"
        >
          {theme === 'dark'
            ? t('rodape.alternarTemaClaro')
            : t('rodape.alternarTemaEscuro')}
        </button>
      </div>
    </footer>
  )
}
