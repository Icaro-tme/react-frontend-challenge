import { useTranslation } from 'react-i18next'
import type { Movie } from '../../../entities/movie/model/types'
import { MovieModalShell } from '../../../shared/ui/movie-modal-shell'

interface WatchlistModalProps {
  isOpen: boolean
  movie: Movie | null
  watchlistMovies: Movie[]
  onClose: () => void
  inWatchlist: (movieId: number) => boolean
  onAddToWatchlist: (movieId: number) => void
  onRemoveFromWatchlist: (movieId: number) => void
  onSetWatched: (movieId: number, watched: boolean) => void
}

export function WatchlistModal({
  isOpen,
  movie,
  watchlistMovies,
  onClose,
  inWatchlist,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onSetWatched,
}: WatchlistModalProps) {
  const { t } = useTranslation()
  const movieNaWatchlist = movie ? inWatchlist(movie.id) : false

  return (
    <MovieModalShell
      isOpen={isOpen}
      title={t('filmes.modais.watchlist.titulo')}
      closeLabel={t('acoes.fechar')}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {movie
              ? `${t('filmes.modais.watchlist.filmeSelecionado')}: ${movie.title}`
              : t('filmes.modais.watchlist.nenhumFilmeSelecionado')}
          </p>

          <button
            type="button"
            className="btn btn--emerald"
            disabled={!movie}
            onClick={() => {
              if (!movie) {
                return
              }

              if (movieNaWatchlist) {
                onRemoveFromWatchlist(movie.id)
                return
              }

              onAddToWatchlist(movie.id)
            }}
          >
            {movieNaWatchlist
              ? t('filmes.modais.watchlist.removerFilme')
              : t('filmes.modais.watchlist.adicionarFilme')}
          </button>
        </div>

        {watchlistMovies.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t('filmes.modais.watchlist.listaVazia')}
          </p>
        ) : (
          <div className="grid max-h-72 grid-cols-1 gap-3 overflow-auto pr-1 md:grid-cols-2">
            {watchlistMovies.map((movieAtual) => (
              <article
                key={movieAtual.id}
                className={`rounded-xl border p-3 ${
                  movieAtual.watched
                    ? 'border-emerald-500 bg-emerald-50/70 dark:border-emerald-500 dark:bg-emerald-900/20'
                    : 'border-slate-200 bg-white/80 dark:border-slate-700 dark:bg-slate-800/70'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {movieAtual.title}
                    </h4>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      {movieAtual.genres.slice(0, 3).join(', ') || '-'}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn-chip btn-chip--cyan"
                    onClick={() => {
                      onRemoveFromWatchlist(movieAtual.id)
                    }}
                  >
                    {t('filmes.modais.watchlist.removerLinha')}
                  </button>
                </div>

                <label className="mt-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={movieAtual.watched}
                    onChange={(evento) => {
                      onSetWatched(movieAtual.id, evento.target.checked)
                    }}
                    className="h-4 w-4 cursor-pointer"
                  />
                  {t('filmes.modais.watchlist.marcarAssistido')}
                </label>
              </article>
            ))}
          </div>
        )}
      </div>
    </MovieModalShell>
  )
}
