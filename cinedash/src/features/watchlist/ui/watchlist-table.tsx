import {
  FaCircleCheck,
  FaCircleInfo,
  FaHeart,
  FaListCheck,
  FaRegCircleCheck,
  FaRegHeart,
  FaTrash,
} from 'react-icons/fa6'
import type { Movie } from '../../../entities/movie/model/types'
import { ActionIconButton } from '../../../shared/ui/action-icon-button'
import type {
  WatchlistSortDirection,
  WatchlistSortField,
} from '../model/watchlist-filters.types'

function formatDateDDMMYYYY(dateString: string): string {
  if (!dateString || dateString.length < 10) {
    return dateString || '-'
  }

  const [ano, mes, dia] = dateString.split('-')

  return `${dia}/${mes}/${ano}`
}

interface WatchlistTableProps {
  movies: Movie[]
  emptyMessage: string
  labels: {
    titulo: string
    genero: string
    dataLancamento: string
    nota: string
    acoes: string
    favorito: string
    desfavoritar: string
    setlist: string
    removerWatchlist: string
    marcarAssistido: string
    desmarcarAssistido: string
    verDetalhes: string
  }
  ordenacaoCampo: WatchlistSortField
  ordenacaoDirecao: WatchlistSortDirection
  onSort: (campo: WatchlistSortField) => void
  onOpenDetails: (movieId: number) => void
  onToggleFavorite: (movieId: number) => void
  onOpenSetlistModal: (movieId: number) => void
  onRemoveWatchlist: (movieId: number) => void
  onToggleWatched: (movieId: number) => void
}

function SortIndicator({
  campo,
  campoAtivo,
  direcao,
}: {
  campo: WatchlistSortField
  campoAtivo: WatchlistSortField
  direcao: WatchlistSortDirection
}) {
  if (campo !== campoAtivo) {
    return <span className="ml-1 text-slate-400 dark:text-slate-500">↕</span>
  }
  return (
    <span className="ml-1">
      {direcao === 'asc' ? '↑' : '↓'}
    </span>
  )
}

export function WatchlistTable({
  movies,
  emptyMessage,
  labels,
  ordenacaoCampo,
  ordenacaoDirecao,
  onSort,
  onOpenDetails,
  onToggleFavorite,
  onOpenSetlistModal,
  onRemoveWatchlist,
  onToggleWatched,
}: WatchlistTableProps) {
  if (movies.length === 0) {
    return <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{emptyMessage}</p>
  }

  const thSortableClass =
    'px-3 py-2 cursor-pointer select-none transition hover:text-cyan-600 dark:hover:text-cyan-400'
  const thPlainClass = 'px-3 py-2'

  return (
    <div className="mt-4 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="bg-slate-100/90 text-xs uppercase tracking-[0.08em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <tr>
            <th className={thSortableClass} onClick={() => onSort('titulo')}>
              {labels.titulo}
              <SortIndicator campo="titulo" campoAtivo={ordenacaoCampo} direcao={ordenacaoDirecao} />
            </th>
            <th className={thSortableClass} onClick={() => onSort('genero')}>
              {labels.genero}
              <SortIndicator campo="genero" campoAtivo={ordenacaoCampo} direcao={ordenacaoDirecao} />
            </th>
            <th className={thPlainClass}>{labels.dataLancamento}</th>
            <th className={thSortableClass} onClick={() => onSort('nota')}>
              {labels.nota}
              <SortIndicator campo="nota" campoAtivo={ordenacaoCampo} direcao={ordenacaoDirecao} />
            </th>
            <th className={thPlainClass}>{labels.acoes}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {movies.map((movieAtual) => (
            <tr key={movieAtual.id} className="bg-white/70 dark:bg-slate-900/60">
              <td className="px-3 py-2 font-medium text-slate-900 dark:text-slate-100">
                {movieAtual.title}
              </td>
              <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                {movieAtual.genres.slice(0, 3).join(', ') || '-'}
              </td>
              <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                {formatDateDDMMYYYY(movieAtual.releaseDate)}
              </td>
              <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                {movieAtual.voteAverage.toFixed(1)}
              </td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <ActionIconButton
                    size="sm"
                    tooltip={movieAtual.isFavorite ? labels.desfavoritar : labels.favorito}
                    colorClassName="hover:border-amber-400 hover:bg-amber-500 hover:text-white"
                    onClick={() => {
                      onToggleFavorite(movieAtual.id)
                    }}
                  >
                    {movieAtual.isFavorite ? <FaHeart size={13} /> : <FaRegHeart size={13} />}
                  </ActionIconButton>

                  <ActionIconButton
                    size="sm"
                    tooltip={labels.setlist}
                    colorClassName="hover:border-cyan-400 hover:bg-cyan-600 hover:text-white"
                    onClick={() => {
                      onOpenSetlistModal(movieAtual.id)
                    }}
                  >
                    <FaListCheck size={13} />
                  </ActionIconButton>

                  <ActionIconButton
                    size="sm"
                    tooltip={labels.removerWatchlist}
                    colorClassName="hover:border-rose-400 hover:bg-rose-600 hover:text-white"
                    onClick={() => {
                      onRemoveWatchlist(movieAtual.id)
                    }}
                  >
                    <FaTrash size={12} />
                  </ActionIconButton>

                  <ActionIconButton
                    size="sm"
                    tooltip={movieAtual.watched ? labels.desmarcarAssistido : labels.marcarAssistido}
                    colorClassName="hover:border-emerald-400 hover:bg-emerald-600 hover:text-white"
                    onClick={() => {
                      onToggleWatched(movieAtual.id)
                    }}
                  >
                    {movieAtual.watched ? <FaCircleCheck size={13} /> : <FaRegCircleCheck size={13} />}
                  </ActionIconButton>

                  <ActionIconButton
                    size="sm"
                    tooltip={labels.verDetalhes}
                    colorClassName="hover:border-slate-400 hover:bg-slate-700 hover:text-white"
                    onClick={() => {
                      onOpenDetails(movieAtual.id)
                    }}
                  >
                    <FaCircleInfo size={13} />
                  </ActionIconButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
