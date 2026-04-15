import { useNavigate, useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaBookmark,
  FaCircleCheck,
  FaHeart,
  FaListCheck,
  FaRegCircleCheck,
  FaRegHeart,
} from 'react-icons/fa6'
import type { Movie } from '../entities/movie/model/types'
import { useAuthStore } from '../features/auth/model/auth.store'
import { useFavoriteStore } from '../features/favorite/model/favorite.store'
import { SystemPageShell } from '../features/layout/ui/system-page-shell'
import { useLanguageSwitcher } from '../features/locale/hooks/use-language-switcher'
import { useMovieDetails } from '../features/movies/hooks/use-movie-details'
import { useMovieUserState } from '../features/movies/hooks/use-movie-user-state'
import { useSetlistStore } from '../features/setlist/model/setlist.store'
import { SetlistModal } from '../features/setlist/ui/setlist-modal'
import { useThemeStore } from '../features/theme/model/theme.store'
import { useWatchlistStore } from '../features/watchlist/model/watchlist.store'
import { WatchlistModal } from '../features/watchlist/ui/watchlist-modal'
import type { RouteLanguage } from '../shared/config/language'
import { ActionIconButton } from '../shared/ui/action-icon-button'
import { useToast } from '../shared/ui/toast/use-toast'

function MovieDetailsSkeleton() {
  return (
    <section className="animate-pulse">
      <div className="h-8 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-4 h-56 w-full rounded-2xl bg-slate-200 dark:bg-slate-700" />
      <div className="mt-4 h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-2 h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
    </section>
  )
}

export function MovieDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { lang, movieId } = useParams({ strict: false }) as {
    lang: RouteLanguage
    movieId: string
  }

  const [setlistModalAberto, setSetlistModalAberto] = useState(false)
  const [watchlistModalAberto, setWatchlistModalAberto] = useState(false)
  const { showSuccess, showError } = useToast()

  const tema = useThemeStore((s) => s.theme)
  const alternarTema = useThemeStore((s) => s.toggleTheme)
  const { routeLanguage, toggleLanguage } = useLanguageSwitcher()
  const signOut = useAuthStore((s) => s.signOut)

  const isFavorite = useFavoriteStore((s) => s.isFavorite)
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite)
  const filmesFavoritosIds = useFavoriteStore((s) => s.filmesFavoritosIds)

  const setlists = useSetlistStore((s) => s.setlists)
  const createSetlist = useSetlistStore((s) => s.createSetlist)
  const addMovieToSetlist = useSetlistStore((s) => s.addMovieToSetlist)
  const removeMovieFromSetlist = useSetlistStore((s) => s.removeMovieFromSetlist)
  const hasMovieInSetlist = useSetlistStore((s) => s.hasMovieInSetlist)

  const addToWatchlist = useWatchlistStore((s) => s.addToWatchlist)
  const removeFromWatchlist = useWatchlistStore((s) => s.removeFromWatchlist)
  const setWatched = useWatchlistStore((s) => s.setWatched)
  const inWatchlist = useWatchlistStore((s) => s.inWatchlist)
  const isWatched = useWatchlistStore((s) => s.isWatched)
  const filmesWatchlistIds = useWatchlistStore((s) => s.filmesWatchlistIds)
  const filmesAssistidosIds = useWatchlistStore((s) => s.filmesAssistidosIds)

  const estadoUsuario = useMovieUserState({
    favoriteMovieIds: filmesFavoritosIds,
    watchlistMovieIds: filmesWatchlistIds,
    watchedMovieIds: filmesAssistidosIds,
    setlists,
  })

  const movieIdNumber = Number(movieId)
  const movieIdValido = Number.isFinite(movieIdNumber) && movieIdNumber > 0

  const {
    filme,
    elencoPrincipal,
    trailer,
    duracaoMinutos,
    tagline,
    isLoading,
    errorMessage,
  } = useMovieDetails({
    movieId: movieIdValido ? movieIdNumber : 0,
    routeLanguage: lang,
    estadoUsuario,
  })

  function getMoviesBySetlist(setlistId: string): Movie[] {
    if (!filme) return []
    return hasMovieInSetlist(setlistId, filme.id) ? [filme] : []
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
        void navigate({ to: '/$lang/login', params: { lang } })
      }}
      afterMainContent={
        <>
          <SetlistModal
            isOpen={setlistModalAberto && Boolean(filme)}
            movie={setlistModalAberto ? filme : null}
            setlists={setlists}
            getMoviesBySetlist={getMoviesBySetlist}
            hasMovieInSetlist={hasMovieInSetlist}
            onClose={() => setSetlistModalAberto(false)}
            onCreateSetlist={(nomeSetlist) => {
              try {
                createSetlist(nomeSetlist)
                showSuccess(t('filmes.feedback.setlistCriadaSucesso'))
              } catch {
                showError(t('filmes.feedback.setlistCriadaErro'))
              }
            }}
            onAddMovieToSetlist={(setlistId, mid) => {
              try {
                addMovieToSetlist(setlistId, mid)
                showSuccess(t('filmes.feedback.setlistAdicionadoSucesso'))
              } catch {
                showError(t('filmes.feedback.setlistAdicionadoErro'))
              }
            }}
            onRemoveMovieFromSetlist={(setlistId, mid) => {
              try {
                removeMovieFromSetlist(setlistId, mid)
                showSuccess(t('filmes.feedback.setlistRemovidoSucesso'))
              } catch {
                showError(t('filmes.feedback.setlistRemovidoErro'))
              }
            }}
          />

          <WatchlistModal
            isOpen={watchlistModalAberto && Boolean(filme)}
            movie={watchlistModalAberto ? filme : null}
            watchlistMovies={filme && inWatchlist(filme.id) ? [filme] : []}
            inWatchlist={inWatchlist}
            onClose={() => setWatchlistModalAberto(false)}
            onAddToWatchlist={(mid) => {
              try {
                addToWatchlist(mid)
                showSuccess(t('filmes.feedback.watchlistAdicionadoSucesso'))
              } catch {
                showError(t('filmes.feedback.watchlistAdicionadoErro'))
              }
            }}
            onRemoveFromWatchlist={(mid) => {
              try {
                removeFromWatchlist(mid)
                showSuccess(t('filmes.feedback.watchlistRemovidoSucesso'))
              } catch {
                showError(t('filmes.feedback.watchlistRemovidoErro'))
              }
            }}
            onSetWatched={setWatched}
          />
        </>
      }
    >
      {movieIdValido ? (
        <section className="mt-4 rounded-2xl border border-slate-200/90 bg-white/75 p-4 dark:border-slate-700 dark:bg-slate-900/75 md:p-6">
          <button
            type="button"
            className="btn-chip btn-chip--cyan"
            onClick={() => {
              void navigate({ to: '/$lang/dashboard', params: { lang } })
            }}
          >
            {t('filmes.detalhes.voltarPainel')}
          </button>

          {isLoading ? (
            <div className="mt-4">
              <MovieDetailsSkeleton />
            </div>
          ) : errorMessage ? (
            <p className="mt-4 text-sm text-rose-700 dark:text-rose-300">
              {errorMessage}
            </p>
          ) : filme ? (
            <div className="mt-4">
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex-shrink-0 md:w-72">
                  {filme.posterUrl || filme.backdropUrl ? (
                    <img
                      src={filme.posterUrl || filme.backdropUrl}
                      alt={filme.title}
                      className="w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-64 w-full items-center justify-center rounded-2xl bg-slate-800 text-sm font-semibold uppercase tracking-[0.1em] text-slate-200">
                      {t('filmes.semImagem')}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 md:text-3xl">
                    {filme.title}
                  </h2>

                  {tagline ? (
                    <p className="mt-1 text-sm italic text-slate-600 dark:text-slate-400">
                      &ldquo;{tagline}&rdquo;
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="badge-chip badge-chip--amber">
                      ★ {filme.voteAverage.toFixed(1)} ({filme.voteCount})
                    </span>
                    {duracaoMinutos ? (
                      <span className="badge-chip badge-chip--slate">
                        {duracaoMinutos} min
                      </span>
                    ) : null}
                    {filme.releaseDate ? (
                      <span className="badge-chip badge-chip--slate">
                        {filme.releaseDate.slice(0, 4)}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {filme.genres.map((genero) => (
                      <span
                        key={genero}
                        className="rounded-full border border-slate-300 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-700 dark:border-slate-600 dark:text-slate-300"
                      >
                        {genero}
                      </span>
                    ))}
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {filme.overview || '-'}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <ActionIconButton
                      tooltip={
                        isFavorite(filme.id)
                          ? t('filmes.acoes.desfavoritar')
                          : t('filmes.acoes.favoritar')
                      }
                      colorClassName="hover:border-amber-400 hover:bg-amber-500 hover:text-white"
                      onClick={() => {
                        try {
                          const eraFavorito = isFavorite(filme.id)
                          toggleFavorite(filme.id)

                          if (!eraFavorito) {
                            addToWatchlist(filme.id)
                          }

                          showSuccess(
                            eraFavorito
                              ? t('filmes.feedback.favoritoRemovidoSucesso')
                              : t('filmes.feedback.favoritoSucesso'),
                          )
                        } catch {
                          showError(t('filmes.feedback.favoritoErro'))
                        }
                      }}
                    >
                      {isFavorite(filme.id) ? (
                        <FaHeart size={16} />
                      ) : (
                        <FaRegHeart size={16} />
                      )}
                    </ActionIconButton>

                    <ActionIconButton
                      tooltip={t('filmes.acoes.setlist')}
                      colorClassName="hover:border-cyan-400 hover:bg-cyan-600 hover:text-white"
                      onClick={() => setSetlistModalAberto(true)}
                    >
                      <FaListCheck size={16} />
                    </ActionIconButton>

                    <ActionIconButton
                      tooltip={
                        inWatchlist(filme.id)
                          ? t('filmes.acoes.removerWatchlist')
                          : t('filmes.acoes.adicionarWatchlist')
                      }
                      colorClassName="hover:border-indigo-400 hover:bg-indigo-600 hover:text-white"
                      onClick={() => setWatchlistModalAberto(true)}
                    >
                      <FaBookmark size={16} />
                    </ActionIconButton>

                    <ActionIconButton
                      tooltip={
                        isWatched(filme.id)
                          ? t('filmes.acoes.desmarcarAssistido')
                          : t('filmes.acoes.marcarAssistido')
                      }
                      colorClassName="hover:border-emerald-400 hover:bg-emerald-600 hover:text-white"
                      onClick={() => setWatched(filme.id, !isWatched(filme.id))}
                    >
                      {isWatched(filme.id) ? (
                        <FaCircleCheck size={16} />
                      ) : (
                        <FaRegCircleCheck size={16} />
                      )}
                    </ActionIconButton>
                  </div>
                </div>
              </div>

              {elencoPrincipal.length > 0 ? (
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {t('filmes.detalhes.elenco')}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {elencoPrincipal.map((ator) => (
                      <span
                        key={ator.id}
                        className="rounded-full border border-slate-300 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-600 dark:text-slate-300"
                      >
                        {ator.nome}
                        {ator.personagem ? ` (${ator.personagem})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {trailer ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {t('filmes.detalhes.trailer')}
                  </h3>
                  <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl">
                    <iframe
                      src={`https://www.youtube.com/embed/${trailer.chave}`}
                      title={trailer.nome}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
              {t('filmes.detalhes.naoEncontrado')}
            </p>
          )}
        </section>
      ) : (
        <section className="mt-4 rounded-2xl border border-rose-200/90 bg-white/75 p-5 dark:border-rose-700/60 dark:bg-slate-900/75">
          <p className="text-sm text-rose-700 dark:text-rose-300">
            {t('filmes.detalhes.idInvalido')}
          </p>
        </section>
      )}
    </SystemPageShell>
  )
}