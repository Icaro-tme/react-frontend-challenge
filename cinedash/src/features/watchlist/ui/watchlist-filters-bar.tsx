import { useTranslation } from 'react-i18next'
import { FaRotateLeft } from 'react-icons/fa6'
import {
  WATCHLIST_STATUS_FILTERS,
  type WatchlistStatusFilter,
} from '../model/watchlist-filters.types'

interface WatchlistFiltersBarProps {
  termoBusca: string
  onTermoBuscaChange: (termo: string) => void
  statusFiltro: WatchlistStatusFilter
  onStatusFiltroChange: (status: WatchlistStatusFilter) => void
  onLimparFiltros: () => void
  temFiltrosAtivos: boolean
}

export function WatchlistFiltersBar({
  termoBusca,
  onTermoBuscaChange,
  statusFiltro,
  onStatusFiltroChange,
  onLimparFiltros,
  temFiltrosAtivos,
}: WatchlistFiltersBarProps) {
  const { t } = useTranslation()

  return (
    <section className="mt-4 rounded-xl border border-slate-200/80 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/70">
      <div className="grid gap-3 md:grid-cols-[1.5fr_auto] md:items-end">
        <div>
          <label htmlFor="watchlist-termo-busca">
            {t('filmes.watchlist.filtros.tituloBusca')}
          </label>
          <input
            id="watchlist-termo-busca"
            value={termoBusca}
            placeholder={t('filmes.watchlist.filtros.placeholderBusca')}
            onChange={(evento) => {
              onTermoBuscaChange(evento.target.value)
            }}
          />
        </div>

        <div className="flex justify-end">
          <div className="relative group/clear">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:border-amber-500 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-amber-400 dark:hover:text-amber-300"
              aria-label={t('filmes.filtros.limparFiltros')}
              disabled={!temFiltrosAtivos}
              onClick={onLimparFiltros}
            >
              <FaRotateLeft size={13} />
            </button>

            <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 rounded-md bg-slate-950/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-100 opacity-0 transition duration-200 group-hover/clear:opacity-100">
              {t('filmes.filtros.limparFiltros')}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {WATCHLIST_STATUS_FILTERS.map((statusAtual) => {
          const estaAtivo = statusAtual === statusFiltro

          return (
            <button
              key={statusAtual}
              type="button"
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] transition ${
                estaAtivo
                  ? 'border-cyan-500 bg-cyan-600 text-white dark:border-cyan-400 dark:bg-cyan-500'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-cyan-500 hover:text-cyan-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-300'
              }`}
              onClick={() => {
                onStatusFiltroChange(statusAtual)
              }}
            >
              {t(`filmes.watchlist.filtros.status.${statusAtual}`)}
            </button>
          )
        })}
      </div>
    </section>
  )
}
