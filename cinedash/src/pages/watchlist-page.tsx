import { useNavigate, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../features/auth/model/auth.store'
import { useFavoriteStore } from '../features/favorite/model/favorite.store'
import { SystemPageShell } from '../features/layout/ui/system-page-shell'
import { useLanguageSwitcher } from '../features/locale/hooks/use-language-switcher'
import { useMovieUserState } from '../features/movies/hooks/use-movie-user-state'
import { MoviesPaginationControls } from '../features/movies/ui/movies-pagination-controls'
import { useSetlistStore } from '../features/setlist/model/setlist.store'
import { SetlistModal } from '../features/setlist/ui/setlist-modal'
import { useThemeStore } from '../features/theme/model/theme.store'
import { useWatchlistStore } from '../features/watchlist/model/watchlist.store'
import { useWatchlistPageState } from '../features/watchlist/hooks/use-watchlist-page-state'
import { WatchlistFiltersBar } from '../features/watchlist/ui/watchlist-filters-bar'
import { WatchlistTable } from '../features/watchlist/ui/watchlist-table'
import type { RouteLanguage } from '../shared/config/language'

export function WatchlistPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { lang } = useParams({ strict: false }) as { lang: RouteLanguage }
  const tema = useThemeStore((estadoAtual) => estadoAtual.theme)
  const alternarTema = useThemeStore((estadoAtual) => estadoAtual.toggleTheme)
  const signOut = useAuthStore((estadoAtual) => estadoAtual.signOut)
  const { routeLanguage, toggleLanguage } = useLanguageSwitcher()

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

  const estadoUsuario = useMovieUserState({
    favoriteMovieIds: filmesFavoritosIds,
    watchlistMovieIds: filmesWatchlistIds,
    watchedMovieIds: filmesAssistidosIds,
    setlists,
  })

  function toggleFavorite(movieId: number) {
    const eraFavorito = isFavorite(movieId)
    toggleFavoriteStore(movieId)

    if (!eraFavorito) {
      addToWatchlist(movieId)
    }
  }

  const {
    isLoading,
    errorMessage,
    filmesWatchlistPaginados,
    totalResultados,
    totalPaginas,
    paginaAtualVisual,
    termoBuscaInput,
    statusFiltro,
    ordenacaoCampo,
    ordenacaoDirecao,
    temFiltrosAtivos,
    movieSetlistSelecionado,
    getMoviesBySetlist,
    hasMovieInSetlist: hasMovieInSetlistFromHook,
    createSetlist: createSetlistFromHook,
    addMovieToSetlist: addMovieToSetlistFromHook,
    removeMovieFromSetlist: removeMovieFromSetlistFromHook,
    removeFromWatchlist,
    setWatched,
    isWatched,
    onTermoBuscaChange,
    onStatusFiltroChange,
    onOrdenacaoCampoChange,
    onOrdenacaoDirecaoChange,
    onLimparFiltros,
    onChangePage,
    onOpenSetlistModal,
    onCloseSetlistModal,
  } = useWatchlistPageState({
    routeLanguage: lang,
    mensagemErroPadrao: t('acoes.erroGenerico'),
    estadoUsuario,
    setlists,
    toggleFavorite,
    createSetlist,
    addMovieToSetlist,
    removeMovieFromSetlist,
    hasMovieInSetlist,
  })

  return (
    <SystemPageShell
      lang={lang}
      activeTab="watchlist"
      theme={tema}
      routeLanguage={routeLanguage}
      onToggleTheme={alternarTema}
      onToggleLanguage={toggleLanguage}
      onSignOut={() => {
        signOut()

        void navigate({
          to: '/$lang/login',
          params: {
            lang,
          },
        })
      }}
      afterMainContent={
        <SetlistModal
          isOpen={Boolean(movieSetlistSelecionado)}
          movie={movieSetlistSelecionado}
          setlists={setlists}
          getMoviesBySetlist={getMoviesBySetlist}
          hasMovieInSetlist={hasMovieInSetlistFromHook}
          onClose={onCloseSetlistModal}
          onCreateSetlist={createSetlistFromHook}
          onAddMovieToSetlist={addMovieToSetlistFromHook}
          onRemoveMovieFromSetlist={removeMovieFromSetlistFromHook}
        />
      }
    >
        <section className="mt-4 rounded-2xl border border-slate-200/90 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t('filmes.watchlist.titulo')}
          </h2>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {t('filmes.watchlist.descricao')}
          </p>

          <WatchlistFiltersBar
            termoBusca={termoBuscaInput}
            onTermoBuscaChange={onTermoBuscaChange}
            statusFiltro={statusFiltro}
            onStatusFiltroChange={onStatusFiltroChange}
            temFiltrosAtivos={temFiltrosAtivos}
            onLimparFiltros={onLimparFiltros}
          />

          {errorMessage ? (
            <p className="mt-3 text-sm text-rose-700 dark:text-rose-300">{errorMessage}</p>
          ) : null}

          <WatchlistTable
            movies={filmesWatchlistPaginados}
            emptyMessage={t('filmes.modais.watchlist.listaVazia')}
            ordenacaoCampo={ordenacaoCampo}
            ordenacaoDirecao={ordenacaoDirecao}
            onSort={(campo) => {
              if (campo === ordenacaoCampo) {
                onOrdenacaoDirecaoChange(ordenacaoDirecao === 'asc' ? 'desc' : 'asc')
              } else {
                onOrdenacaoCampoChange(campo)
                onOrdenacaoDirecaoChange('asc')
              }
            }}
            labels={{
              titulo: t('filmes.watchlist.colunas.titulo'),
              genero: t('filmes.watchlist.colunas.genero'),
              dataLancamento: t('filmes.watchlist.colunas.dataLancamento'),
              nota: t('filmes.watchlist.colunas.nota'),
              acoes: t('filmes.watchlist.colunas.acoes'),
              favorito: t('filmes.acoes.favoritar'),
              desfavoritar: t('filmes.acoes.desfavoritar'),
              setlist: t('filmes.acoes.setlist'),
              removerWatchlist: t('filmes.acoes.removerWatchlist'),
              marcarAssistido: t('filmes.acoes.marcarAssistido'),
              desmarcarAssistido: t('filmes.acoes.desmarcarAssistido'),
              verDetalhes: t('filmes.acoes.verDetalhes'),
            }}
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
            onOpenSetlistModal={onOpenSetlistModal}
            onRemoveWatchlist={removeFromWatchlist}
            onToggleWatched={(movieId) => {
              setWatched(movieId, !isWatched(movieId))
            }}
          />

          <MoviesPaginationControls
            paginaAtual={paginaAtualVisual}
            totalPaginas={totalPaginas}
            totalResultados={totalResultados}
            isLoading={isLoading}
            onChangePage={onChangePage}
          />
        </section>
    </SystemPageShell>
  )
}
