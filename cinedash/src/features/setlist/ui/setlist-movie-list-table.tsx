import type { ReactNode } from 'react'
import { FaArrowTrendUp } from 'react-icons/fa6'
import type { Movie } from '../../../entities/movie/model/types'
import type { FilmeSetlistAnaliseSpoor } from '../model/setlist-analysis.types'

interface AnalysisColumnLabels {
  nota: string
  popularidade: string
  budget: string
  ano: string
  trending: string
}

interface SetlistMovieListTableProps {
  movies: Movie[]
  emptyMessage: string
  movieHeaderLabel: string
  genresHeaderLabel: string
  actionsHeaderLabel: string
  renderActions: (movie: Movie) => ReactNode
  analysisData?: FilmeSetlistAnaliseSpoor[]
  analysisColumnLabels?: AnalysisColumnLabels
  formatBudget?: (valor: number) => string
}

export function SetlistMovieListTable({
  movies,
  emptyMessage,
  movieHeaderLabel,
  genresHeaderLabel,
  actionsHeaderLabel,
  renderActions,
  analysisData,
  analysisColumnLabels,
  formatBudget,
}: SetlistMovieListTableProps) {
  if (movies.length === 0) {
    return <p className="text-sm text-slate-600 dark:text-slate-300">{emptyMessage}</p>
  }

  const temAnalise = analysisData && analysisData.length > 0 && analysisColumnLabels
  const analisePorId = temAnalise
    ? new Map(analysisData.map((item) => [item.id, item]))
    : null

  return (
    <div className="max-h-[500px] overflow-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm text-left">
        <thead className="sticky top-0 bg-slate-100/90 text-xs uppercase tracking-[0.08em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <tr>
            <th className="px-3 py-2">{movieHeaderLabel}</th>
            <th className="px-3 py-2">{genresHeaderLabel}</th>
            {temAnalise ? (
              <>
                <th className="px-3 py-2">{analysisColumnLabels.nota}</th>
                <th className="px-3 py-2">{analysisColumnLabels.popularidade}</th>
                <th className="px-3 py-2">{analysisColumnLabels.budget}</th>
                <th className="px-3 py-2">{analysisColumnLabels.ano}</th>
                <th className="px-3 py-2">{analysisColumnLabels.trending}</th>
              </>
            ) : null}
            <th className="px-3 py-2">{actionsHeaderLabel}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {movies.map((movieAtual) => {
            const filmeAnalise = analisePorId?.get(movieAtual.id)

            return (
              <tr key={movieAtual.id} className="bg-white/70 dark:bg-slate-900/60">
                <td className="px-3 py-2 font-medium text-slate-900 dark:text-slate-100">
                  {movieAtual.title}
                </td>
                <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                  {movieAtual.genres.slice(0, 3).join(', ') || '-'}
                </td>
                {temAnalise ? (
                  <>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                      {filmeAnalise ? filmeAnalise.notaMedia.toFixed(1) : movieAtual.voteAverage.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                      {filmeAnalise ? filmeAnalise.popularidade.toFixed(1) : movieAtual.popularity.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                      {filmeAnalise && filmeAnalise.budget > 0
                        ? (formatBudget ? formatBudget(filmeAnalise.budget) : `$${filmeAnalise.budget.toLocaleString()}`)
                        : '-'}
                    </td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                      {filmeAnalise?.anoLancamento ?? (movieAtual.releaseDate ? movieAtual.releaseDate.slice(0, 4) : '-')}
                    </td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                      {filmeAnalise?.emTendencia ? (
                        <FaArrowTrendUp className="text-emerald-500" size={14} />
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </>
                ) : null}
                <td className="px-3 py-2">{renderActions(movieAtual)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
