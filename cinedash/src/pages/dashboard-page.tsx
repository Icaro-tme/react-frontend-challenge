import { useNavigate, useParams } from '@tanstack/react-router'
import { useCallback, useMemo, useState } from 'react'
import type { Movie } from '../entities/movie/model/types'
import { useAuthStore } from '../features/auth/model/auth.store'
import { useFavoriteStore } from '../features/favorite/model/favorite.store'
import { SystemPageShell } from '../features/layout/ui/system-page-shell'
import { useLanguageSwitcher } from '../features/locale/hooks/use-language-switcher'
import { useMovieUserState } from '../features/movies/hooks/use-movie-user-state'
import { MoviesDashboardPanel } from '../features/movies/ui/movies-dashboard-panel'
import { useSetlistAnalysis } from '../features/setlist/hooks/use-setlist-analysis'
import { useSetlistStore } from '../features/setlist/model/setlist.store'
import { SetlistAnalysisCollapsible } from '../features/setlist/ui/setlist-analysis-collapsible'
import { SetlistModal } from '../features/setlist/ui/setlist-modal'
import { useThemeStore } from '../features/theme/model/theme.store'
import { useWatchlistStore } from '../features/watchlist/model/watchlist.store'
import { WatchlistModal } from '../features/watchlist/ui/watchlist-modal'
import type { RouteLanguage } from '../shared/config/language'

export function DashboardPage() {
  const navigate = useNavigate()
  const { lang } = useParams({ strict: false }) as { lang: RouteLanguage }

  const tema = useThemeStore((state) => state.theme)
  const alternarTema = useThemeStore((state) => state.toggleTheme)
  const { routeLanguage, toggleLanguage } = useLanguageSwitcher()
  const signOut = useAuthStore((state) => state.signOut)

  const setlists = useSetlistStore((estadoAtual) => estadoAtual.setlists)
  const createSetlist = useSetlistStore((estadoAtual) => estadoAtual.createSetlist)
  const addMovieToSetlist = useSetlistStore(
    (estadoAtual) => estadoAtual.addMovieToSetlist,
  )
  const removeMovieFromSetlist = useSetlistStore(
    (estadoAtual) => estadoAtual.removeMovieFromSetlist,
  )
  const hasMovieInSetlist = useSetlistStore(
    (estadoAtual) => estadoAtual.hasMovieInSetlist,
  )

  const filmesFavoritosIds = useFavoriteStore(
    (estadoAtual) => estadoAtual.filmesFavoritosIds,
  )
  const isFavorite = useFavoriteStore((estadoAtual) => estadoAtual.isFavorite)
  const toggleFavoriteStore = useFavoriteStore(
    (estadoAtual) => estadoAtual.toggleFavorite,
  )

  const filmesWatchlistIds = useWatchlistStore(
    (estadoAtual) => estadoAtual.filmesWatchlistIds,
  )
  const filmesAssistidosIds = useWatchlistStore(
    (estadoAtual) => estadoAtual.filmesAssistidosIds,
  )
  const addToWatchlist = useWatchlistStore((estadoAtual) => estadoAtual.addToWatchlist)
  const removeFromWatchlist = useWatchlistStore(
    (estadoAtual) => estadoAtual.removeFromWatchlist,
  )
  const setWatched = useWatchlistStore((estadoAtual) => estadoAtual.setWatched)
  const inWatchlist = useWatchlistStore((estadoAtual) => estadoAtual.inWatchlist)
  const isWatched = useWatchlistStore((estadoAtual) => estadoAtual.isWatched)

  const estadoUsuario = useMovieUserState({
    favoriteMovieIds: filmesFavoritosIds,
    watchlistMovieIds: filmesWatchlistIds,
    watchedMovieIds: filmesAssistidosIds,
    setlists,
  })

  const [setlistDestaqueId, setSetlistDestaqueId] = useState('')
  const [movieSetlistSelecionado, setMovieSetlistSelecionado] =
    useState<Movie | null>(null)
  const [movieWatchlistSelecionado, setMovieWatchlistSelecionado] =
    useState<Movie | null>(null)
  const [catalogoFilmes, setCatalogoFilmes] = useState<Movie[]>([])
  const [filmesWatchlistCatalogados, setFilmesWatchlistCatalogados] = useState<Movie[]>([])

  const setlistSelecionada = useMemo(
    () => setlists.find((setlistAtual) => setlistAtual.id === setlistDestaqueId) ?? null,
    [setlists, setlistDestaqueId],
  )

  const setlistDestaqueMovieIds = useMemo(() => {
    if (!setlistSelecionada) {
      return []
    }

    return setlistSelecionada.movieIds
  }, [setlistSelecionada])

  const nomeSetlistDestaque = setlistSelecionada?.name

  const {
    analiseAtual,
    analiseAnterior,
    isCalculandoAnalise,
    calcularAnalise,
    statusAnalise,
  } = useSetlistAnalysis({
    routeLanguage: lang,
    setlistSelecionada,
  })

  const analiseParaExibir = analiseAtual ?? analiseAnterior

  const onCatalogChange = useCallback(
    (catalogoAtual: Movie[], watchlistAtual: Movie[]) => {
      setCatalogoFilmes(catalogoAtual)
      setFilmesWatchlistCatalogados(watchlistAtual)
    },
    [],
  )

  function toggleFavorite(movieId: number) {
    const eraFavorito = isFavorite(movieId)
    toggleFavoriteStore(movieId)

    if (!eraFavorito) {
      addToWatchlist(movieId)
    }
  }

  function toggleWatched(movieId: number) {
    setWatched(movieId, !isWatched(movieId))
  }

  function getMoviesBySetlist(setlistId: string): Movie[] {
    const setlistAtual = setlists.find(
      (setlistAtualInterna) => setlistAtualInterna.id === setlistId,
    )

    if (!setlistAtual) {
      return []
    }

    return catalogoFilmes.filter((filmeAtual) =>
      setlistAtual.movieIds.includes(filmeAtual.id),
    )
  }

  return (
    <SystemPageShell
      lang={lang}
      activeTab="dashboard"
      theme={tema}
      routeLanguage={routeLanguage}
      onToggleTheme={alternarTema}
      onToggleLanguage={toggleLanguage}
      onSignOut={() => {
        signOut()

        void navigate({
          to: '/$lang/login',
          params: { lang },
        })
      }}
      afterMainContent={
        <>
          <SetlistModal
            isOpen={Boolean(movieSetlistSelecionado)}
            movie={movieSetlistSelecionado}
            setlists={setlists}
            getMoviesBySetlist={getMoviesBySetlist}
            hasMovieInSetlist={hasMovieInSetlist}
            onClose={() => {
              setMovieSetlistSelecionado(null)
            }}
            onCreateSetlist={createSetlist}
            onAddMovieToSetlist={addMovieToSetlist}
            onRemoveMovieFromSetlist={removeMovieFromSetlist}
          />

          <WatchlistModal
            isOpen={Boolean(movieWatchlistSelecionado)}
            movie={movieWatchlistSelecionado}
            watchlistMovies={filmesWatchlistCatalogados}
            inWatchlist={inWatchlist}
            onClose={() => {
              setMovieWatchlistSelecionado(null)
            }}
            onAddToWatchlist={addToWatchlist}
            onRemoveFromWatchlist={removeFromWatchlist}
            onSetWatched={setWatched}
          />
        </>
      }
    >
      <SetlistAnalysisCollapsible
        setlists={setlists}
        setlistSelecionadaId={setlistDestaqueId}
        onSetlistSelecionadaChange={setSetlistDestaqueId}
        analiseResumo={analiseParaExibir}
        isCalculandoAnalise={isCalculandoAnalise}
        statusAnalise={statusAnalise}
        onCalcularAnalise={calcularAnalise}
        routeLanguage={lang}
      />

      <MoviesDashboardPanel
        routeLanguage={lang}
        estadoUsuario={estadoUsuario}
        onOpenDetails={(movieId) => {
          void navigate({
            to: '/$lang/movie/$movieId',
            params: {
              lang,
              movieId: String(movieId),
            },
          })
        }}
        onToggleFavorite={toggleFavorite}
        onToggleWatched={toggleWatched}
        onOpenSetlistModal={setMovieSetlistSelecionado}
        onOpenWatchlistModal={setMovieWatchlistSelecionado}
        onCatalogChange={onCatalogChange}
        setlistDestaqueMovieIds={setlistDestaqueMovieIds}
        nomeSetlistDestaque={nomeSetlistDestaque}
      />
    </SystemPageShell>
  )
}
