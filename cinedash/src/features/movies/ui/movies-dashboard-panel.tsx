import type { Movie } from '../../../entities/movie/model/types'
import type { EstadoUsuarioFilmesSnapshot } from '../../../entities/user/model/user-movie-state.types'
import type { RouteLanguage } from '../../../shared/config/language'
import { MoviesListingPanel } from './movies-listing-panel.tsx'
import type { MovieListingView } from '../model/movies-dashboard.types'

interface MoviesDashboardPanelProps {
  routeLanguage: RouteLanguage
  estadoUsuario: EstadoUsuarioFilmesSnapshot
  onOpenDetails: (movieId: number) => void
  onToggleFavorite: (movieId: number) => void
  onToggleWatched: (movieId: number) => void
  onOpenSetlistModal?: (movie: Movie) => void
  onOpenWatchlistModal?: (movie: Movie) => void
  onCatalogChange?: (catalogoFilmes: Movie[], filmesWatchlist: Movie[]) => void
  viewInicial?: MovieListingView
  viewsDisponiveis?: MovieListingView[]
  setlistDestaqueMovieIds?: number[]
  nomeSetlistDestaque?: string
}

export function MoviesDashboardPanel({
  routeLanguage,
  estadoUsuario,
  onOpenDetails,
  onToggleFavorite,
  onToggleWatched,
  onOpenSetlistModal,
  onOpenWatchlistModal,
  onCatalogChange,
  viewInicial,
  viewsDisponiveis,
  setlistDestaqueMovieIds,
  nomeSetlistDestaque,
}: MoviesDashboardPanelProps) {
  return (
    <MoviesListingPanel
      routeLanguage={routeLanguage}
      estadoUsuario={estadoUsuario}
      onOpenDetails={onOpenDetails}
      onToggleFavorite={onToggleFavorite}
      onToggleWatched={onToggleWatched}
      onOpenSetlistModal={onOpenSetlistModal}
      onOpenWatchlistModal={onOpenWatchlistModal}
      onCatalogChange={onCatalogChange}
      viewInicial={viewInicial}
      viewsDisponiveis={viewsDisponiveis}
      setlistDestaqueMovieIds={setlistDestaqueMovieIds}
      nomeSetlistDestaque={nomeSetlistDestaque}
    />
  )
}
