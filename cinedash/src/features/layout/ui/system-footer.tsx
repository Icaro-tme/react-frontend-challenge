import { useTranslation } from 'react-i18next'

export function SystemFooter() {
  const { t } = useTranslation()

  return (
    <footer className="mt-auto border-t border-slate-300/70 bg-slate-900/95 text-slate-200 dark:border-slate-700 dark:bg-slate-950/95">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-2 px-4 py-4 text-xs md:flex-row md:items-center md:justify-between md:px-8">
        <p className="font-medium text-slate-300">{t('rodape.assinatura')}</p>

        <p className="text-slate-300">
          {t('rodape.contato')}: 
          <a
            href="mailto:icaroabarros@hotmail.com"
            className="font-medium text-cyan-300 underline underline-offset-4 transition hover:text-cyan-200"
          >
            icaroabarros@hotmail.com
          </a>
        </p>
      </div>
    </footer>
  )
}