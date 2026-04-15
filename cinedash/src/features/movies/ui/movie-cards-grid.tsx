import { MovieCard } from '../../../entities/movie/ui/movie-card'
import { MovieCardSkeleton } from '../../../entities/movie/ui/movie-card-skeleton'
import type { Movie } from '../../../entities/movie/model/types'

interface MovieCardLabels {
  favorite: string
  unfavorite: string
  setlist: string
  addWatchlist: string
  removeWatchlist: string
  markWatched: string
  unmarkWatched: string
  details: string
  noImage: string
  indicadorFavoritado: string
  indicadorAssistido: string
  indicadorNaSetlist: string
  maisSetlists: string
}

interface MovieCardsGridProps {
  movies: Movie[]
  isLoading: boolean
  emptyMessage: string
  labels: MovieCardLabels
  setlistDestaqueMovieIds?: number[]
  nomeSetlistDestaque?: string
  onOpenDetails: (movieId: number) => void
  onToggleFavorite: (movieId: number) => void
  onOpenSetlistModal: (movieId: number) => void
  onOpenWatchlistModal: (movieId: number) => void
  onToggleWatched: (movieId: number) => void
}

export function MovieCardsGrid({
  movies,
  isLoading,
  emptyMessage,
  labels,
  setlistDestaqueMovieIds = [],
  nomeSetlistDestaque,
  onOpenDetails,
  onToggleFavorite,
  onOpenSetlistModal,
  onOpenWatchlistModal,
  onToggleWatched,
}: MovieCardsGridProps) {
  if (isLoading) {
    return (
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, indice) => (
          <MovieCardSkeleton key={`movie-card-skeleton-${indice}`} />
        ))}
      </div>
    )
  }

  if (movies.length === 0) {
    return <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{emptyMessage}</p>
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {movies.map((filmeAtual) => (
        <MovieCard
          key={filmeAtual.id}
          movie={filmeAtual}
          labels={labels}
          estaEmSetlistDestaque={setlistDestaqueMovieIds.includes(filmeAtual.id)}
          nomeSetlistDestaque={nomeSetlistDestaque}
          onOpenDetails={onOpenDetails}
          onToggleFavorite={onToggleFavorite}
          onOpenSetlistModal={onOpenSetlistModal}
          onOpenWatchlistModal={onOpenWatchlistModal}
          onToggleWatched={onToggleWatched}
        />
      ))}
    </div>
  )
}
