import { useQueries } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaBookmark,
  FaCircleCheck,
  FaFileExport,
  FaFileImport,
  FaHeart,
  FaListCheck,
  FaMagnifyingGlass,
  FaPlus,
  FaRegCircleCheck,
  FaRegHeart,
  FaTrash,
} from 'react-icons/fa6'
import { mapTmdbMovieDetails, mapTmdbMovieList } from '../entities/movie/model/mapper'
import { selectMovieById } from '../entities/movie/model/selectors'
import { useAuthStore } from '../features/auth/model/auth.store'
import { useFavoriteStore } from '../features/favorite/model/favorite.store'
import { SystemPageShell } from '../features/layout/ui/system-page-shell'
import { useLanguageSwitcher } from '../features/locale/hooks/use-language-switcher'
import { useMovieUserState } from '../features/movies/hooks/use-movie-user-state'
import {
  movieDetailsQueryOptions,
  useMovieGenresQuery,
  useSearchMoviesQuery,
} from '../entities/movie/api/movie.query'
import { buildMovieGenresById } from '../entities/movie/model/genres'
import { useSetlistPageActions } from '../features/setlist/hooks/use-setlist-page-actions'
import {
  createExportableUserData,
  exportUserDataAsJson,
  parseImportedJson,
} from '../features/setlist/model/data-transfer'
import { useSetlistStore } from '../features/setlist/model/setlist.store'
import { useSetlistAnalysis } from '../features/setlist/hooks/use-setlist-analysis.ts'
import { SetlistAnalysisDashboard } from '../features/setlist/ui/setlist-analysis-dashboard'
import { SetlistMovieListTable } from '../features/setlist/ui/setlist-movie-list-table'
import { useThemeStore } from '../features/theme/model/theme.store'
import { useWatchlistStore } from '../features/watchlist/model/watchlist.store'
import { WatchlistModal } from '../features/watchlist/ui/watchlist-modal'
import { appSettings } from '../shared/config/app-settings'
import type { RouteLanguage } from '../shared/config/language'
import { getUsuarioAtualKey } from '../shared/lib/auth-session'
import { useDebouncedValue } from '../shared/hooks/use-debounced-value'
import { getErrorMessage } from '../shared/lib/get-error-message'
import { ActionIconButton } from '../shared/ui/action-icon-button'
import { useToast } from '../shared/ui/toast/use-toast'

export function SetlistPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { lang } = useParams({ strict: false }) as { lang: RouteLanguage }
  const tema = useThemeStore((estadoAtual) => estadoAtual.theme)
  const alternarTema = useThemeStore((estadoAtual) => estadoAtual.toggleTheme)
  const signOut = useAuthStore((estadoAtual) => estadoAtual.signOut)
  const { routeLanguage, toggleLanguage } = useLanguageSwitcher()

  const canExport = useAuthStore((estadoAtual) => estadoAtual.canExport())

  const toggleFavorite = useFavoriteStore((estadoAtual) => estadoAtual.toggleFavorite)
  const isFavorite = useFavoriteStore((estadoAtual) => estadoAtual.isFavorite)
  const filmesFavoritosIds = useFavoriteStore(
    (estadoAtual) => estadoAtual.filmesFavoritosIds,
  )

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

  const addToWatchlist = useWatchlistStore((estadoAtual) => estadoAtual.addToWatchlist)
  const removeFromWatchlist = useWatchlistStore(
    (estadoAtual) => estadoAtual.removeFromWatchlist,
  )
  const setWatched = useWatchlistStore((estadoAtual) => estadoAtual.setWatched)
  const inWatchlist = useWatchlistStore((estadoAtual) => estadoAtual.inWatchlist)
  const isWatched = useWatchlistStore((estadoAtual) => estadoAtual.isWatched)
  const filmesWatchlistIds = useWatchlistStore(
    (estadoAtual) => estadoAtual.filmesWatchlistIds,
  )
  const filmesAssistidosIds = useWatchlistStore(
    (estadoAtual) => estadoAtual.filmesAssistidosIds,
  )

  const estadoUsuario = useMovieUserState({
    favoriteMovieIds: filmesFavoritosIds,
    watchlistMovieIds: filmesWatchlistIds,
    watchedMovieIds: filmesAssistidosIds,
    setlists,
  })
  const generosQuery = useMovieGenresQuery({ routeLanguage: lang })
  const generosPorId = useMemo(
    () => buildMovieGenresById(generosQuery.data?.genres),
    [generosQuery.data?.genres],
  )

  const { showError, showSuccess } = useToast()

  const importFileRef = useRef<HTMLInputElement>(null)

  const [setlistSelecionadaId, setSetlistSelecionadaId] = useState('')
  const [painelAcoesAberto, setPainelAcoesAberto] = useState(false)
  const [nomeNovaSetlist, setNomeNovaSetlist] = useState('')
  const [termoBuscaFilmeInput, setTermoBuscaFilmeInput] = useState('')
  const [filmeSugestaoSelecionadoId, setFilmeSugestaoSelecionadoId] = useState<
    number | null
  >(null)
  const [movieIdWatchlistModal, setMovieIdWatchlistModal] = useState<number | null>(null)

  const termoBuscaFilmeDebounced = useDebouncedValue(
    termoBuscaFilmeInput,
    appSettings.filmes.tempoDebounceFiltrosMs,
  )

  const setlistSelecionadaIdEfetiva = useMemo(() => {
    if (setlists.length === 0) {
      return ''
    }

    const setlistSelecionadaExiste = setlists.some(
      (setlistAtual) => setlistAtual.id === setlistSelecionadaId,
    )

    if (setlistSelecionadaExiste) {
      return setlistSelecionadaId
    }

    return setlists[0].id
  }, [setlistSelecionadaId, setlists])

  const setlistSelecionada = useMemo(
    () =>
      setlists.find((setlistAtual) => setlistAtual.id === setlistSelecionadaIdEfetiva) ??
      null,
    [setlistSelecionadaIdEfetiva, setlists],
  )

  const {
    statusAnalise,
    analiseAtual,
    analiseAnterior,
    calculadoEmAtual,
    calculadoEmAnterior,
    isCalculandoAnalise,
    erroCalculoAnalise,
    calcularAnalise,
    createCsvExport,
  } = useSetlistAnalysis({
    routeLanguage: lang,
    setlistSelecionada,
  })

  const analiseParaExibir = analiseAtual ?? analiseAnterior
  const calculadoEmReferencia = calculadoEmAtual ?? calculadoEmAnterior

  const formatadorMoedaCompacto = useMemo(
    () =>
      new Intl.NumberFormat(lang, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
    [lang],
  )

  const formatadorDataHora = useMemo(
    () =>
      new Intl.DateTimeFormat(lang, {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    [lang],
  )

  const idsFilmesSetlistSelecionada = setlistSelecionada?.movieIds ?? []

  const detalhesFilmesQueries = useQueries({
    queries: idsFilmesSetlistSelecionada.map((movieIdAtual) =>
      movieDetailsQueryOptions({
        routeLanguage: lang,
        movieId: movieIdAtual,
      }),
    ),
  })

  const filmesSetlistSelecionada = useMemo(() => {
    return detalhesFilmesQueries.flatMap((queryAtual) => {
      if (!queryAtual.data) {
        return []
      }

      return [
        mapTmdbMovieDetails(queryAtual.data, {
          estadoUsuario,
          genresById: generosPorId,
        }),
      ]
    })
  }, [detalhesFilmesQueries, estadoUsuario, generosPorId])

  const carregandoFilmesSetlist = detalhesFilmesQueries.some(
    (queryAtual) => queryAtual.isLoading || queryAtual.isFetching,
  )

  const erroCarregarFilmesSetlist = detalhesFilmesQueries.find(
    (queryAtual) => queryAtual.error,
  )?.error

  const erroFilmesSetlistMensagem = erroCarregarFilmesSetlist
    ? getErrorMessage(
        erroCarregarFilmesSetlist,
        t('filmes.setlistPagina.erroCarregarFilmes'),
      )
    : null

  const termoBuscaValido = termoBuscaFilmeInput.trim().length >= 2

  const buscaFilmesQuery = useSearchMoviesQuery(
    {
      routeLanguage: lang,
      query: termoBuscaFilmeDebounced,
      page: 1,
    },
    {
      enabled: painelAcoesAberto && termoBuscaFilmeDebounced.trim().length >= 2,
    },
  )

  const sugestoesFilmes = useMemo(() => {
    if (!buscaFilmesQuery.data) {
      return []
    }

    return mapTmdbMovieList(buscaFilmesQuery.data, {
      estadoUsuario,
      genresById: generosPorId,
    }).slice(0, 8)
  }, [buscaFilmesQuery.data, estadoUsuario, generosPorId])

  const filmeSugestaoSelecionado = useMemo(() => {
    if (!filmeSugestaoSelecionadoId) {
      return null
    }

    return selectMovieById(sugestoesFilmes, filmeSugestaoSelecionadoId) ?? null
  }, [sugestoesFilmes, filmeSugestaoSelecionadoId])

  const filmeWatchlistSelecionado = useMemo(() => {
    if (!movieIdWatchlistModal) {
      return null
    }

    return selectMovieById(filmesSetlistSelecionada, movieIdWatchlistModal) ?? null
  }, [movieIdWatchlistModal, filmesSetlistSelecionada])

  const filmesWatchlistModal = useMemo(() => {
    return filmesSetlistSelecionada.filter((filmeAtual) => inWatchlist(filmeAtual.id))
  }, [filmesSetlistSelecionada, inWatchlist])

  const {
    createNewSetlist,
    addMovieBySearch,
    toggleMovieFavorite,
    removeMovie,
    getStatusAnaliseLabel,
    getStatusAnaliseClassName,
    exportAnalysisCsv,
  } = useSetlistPageActions({
    canExport,
    statusAnalise,
    nomeNovaSetlist,
    setSetlistSelecionadaId,
    setNomeNovaSetlist,
    setTermoBuscaFilmeInput,
    setFilmeSugestaoSelecionadoId,
    setlistSelecionadaIdEfetiva,
    termoBuscaValido,
    filmeSugestaoSelecionado,
    createSetlist,
    addMovieToSetlist,
    hasMovieInSetlist,
    toggleFavorite: (movieId) => {
      const eraFavorito = isFavorite(movieId)
      toggleFavorite(movieId)

      if (!eraFavorito) {
        addToWatchlist(movieId)
      }
    },
    removeMovieFromSetlist,
    createCsvExport,
  })

  return (
    <SystemPageShell
      lang={lang}
      activeTab="setlist"
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
        <WatchlistModal
          isOpen={Boolean(filmeWatchlistSelecionado)}
          movie={filmeWatchlistSelecionado}
          watchlistMovies={filmesWatchlistModal}
          inWatchlist={inWatchlist}
          onClose={() => {
            setMovieIdWatchlistModal(null)
          }}
          onAddToWatchlist={(movieIdAtual) => {
            try {
              addToWatchlist(movieIdAtual)
              showSuccess(t('filmes.feedback.watchlistAdicionadoSucesso'))
            } catch {
              showError(t('filmes.feedback.watchlistAdicionadoErro'))
            }
          }}
          onRemoveFromWatchlist={(movieIdAtual) => {
            try {
              removeFromWatchlist(movieIdAtual)
              showSuccess(t('filmes.feedback.watchlistRemovidoSucesso'))
            } catch {
              showError(t('filmes.feedback.watchlistRemovidoErro'))
            }
          }}
          onSetWatched={setWatched}
        />
      }
    >
        <section className="mt-4 rounded-2xl border border-slate-200/90 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <span className="badge-chip badge-chip--amber">{t('filmes.setlistPagina.badge')}</span>
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              <FaListCheck className="text-cyan-700 dark:text-cyan-300" />
              {t('filmes.setlistPagina.titulo')}
            </h2>
          </div>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {t('filmes.setlistPagina.descricao')}
          </p>

          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-end">
            <div className="min-w-0 flex-1">
              <label htmlFor="setlist-pagina-select">
                {t('filmes.setlistPagina.selecionarSetlist')}
              </label>

              <select
                id="setlist-pagina-select"
                value={setlistSelecionadaIdEfetiva}
                onChange={(evento) => {
                  setSetlistSelecionadaId(evento.target.value)
                }}
              >
                {setlists.map((setlistAtual) => (
                  <option key={setlistAtual.id} value={setlistAtual.id}>
                    {setlistAtual.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="group/actions relative">
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-500 bg-cyan-600 text-white transition hover:bg-cyan-500"
                aria-expanded={painelAcoesAberto}
                aria-label={
                  painelAcoesAberto
                    ? t('filmes.setlistPagina.fecharAcoes')
                    : t('filmes.setlistPagina.abrirAcoes')
                }
                onClick={() => {
                  setPainelAcoesAberto((estadoAtual) => !estadoAtual)
                }}
              >
                <FaPlus
                  size={14}
                  className={`transition-transform duration-300 ${painelAcoesAberto ? 'rotate-45' : ''}`}
                />
              </button>

              <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-100 opacity-0 transition duration-200 group-hover/actions:opacity-100">
                {painelAcoesAberto
                  ? t('filmes.setlistPagina.fecharAcoes')
                  : t('filmes.setlistPagina.abrirAcoes')}
              </span>
            </div>
          </div>

          <div
            className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ${
              painelAcoesAberto
                ? 'mt-4 grid-rows-[1fr] opacity-100'
                : 'mt-0 grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="min-h-0">
            <section className="grid gap-4 rounded-xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-950/25 lg:grid-cols-2">
              <div>
                <label htmlFor="setlist-nome-nova">
                  {t('filmes.modais.setlist.novaSetlist')}
                </label>

                <input
                  id="setlist-nome-nova"
                  value={nomeNovaSetlist}
                  placeholder={t('filmes.modais.setlist.placeholderNovaSetlist')}
                  onChange={(evento) => {
                    setNomeNovaSetlist(evento.target.value)
                  }}
                />

                <button
                  type="button"
                  className="btn btn--slate mt-3 w-full"
                  onClick={createNewSetlist}
                >
                  {t('filmes.modais.setlist.criarSetlist')}
                </button>
              </div>

              <div>
                <label htmlFor="setlist-busca-filme">
                  {t('filmes.setlistPagina.adicionarFilmeBusca')}
                </label>

                <div className="relative">
                  <input
                    id="setlist-busca-filme"
                    value={termoBuscaFilmeInput}
                    placeholder={t('filmes.setlistPagina.placeholderBuscaFilme')}
                    onChange={(evento) => {
                      setTermoBuscaFilmeInput(evento.target.value)
                      setFilmeSugestaoSelecionadoId(null)
                    }}
                  />

                  <FaMagnifyingGlass
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                    size={13}
                  />
                </div>

                <div className="mt-2 max-h-44 overflow-auto rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900/80">
                  {!termoBuscaFilmeInput.trim() ? (
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {t('filmes.setlistPagina.dicaBusca')}
                    </p>
                  ) : !termoBuscaValido ? (
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {t('filmes.setlistPagina.feedback.termoBuscaInvalido')}
                    </p>
                  ) : buscaFilmesQuery.isFetching ? (
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {t('filmes.setlistPagina.carregandoBusca')}
                    </p>
                  ) : sugestoesFilmes.length === 0 ? (
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {t('filmes.setlistPagina.nenhumResultadoBusca')}
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {sugestoesFilmes.map((filmeAtual) => {
                        const estaSelecionado =
                          filmeSugestaoSelecionadoId === filmeAtual.id

                        const anoLancamento = filmeAtual.releaseDate
                          ? filmeAtual.releaseDate.slice(0, 4)
                          : '-'

                        return (
                          <button
                            key={filmeAtual.id}
                            type="button"
                            className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition ${
                              estaSelecionado
                                ? 'border-cyan-500 bg-cyan-50 text-cyan-900 dark:border-cyan-400 dark:bg-cyan-900/40 dark:text-cyan-100'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-400'
                            }`}
                            onClick={() => {
                              setFilmeSugestaoSelecionadoId(filmeAtual.id)
                            }}
                          >
                            <span className="font-semibold">{filmeAtual.title}</span>
                            <span className="ml-2 text-[11px] opacity-80">({anoLancamento})</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                  {filmeSugestaoSelecionado
                    ? `${t('filmes.setlistPagina.filmeSelecionado')}: ${filmeSugestaoSelecionado.title}`
                    : t('filmes.setlistPagina.nenhumFilmeSelecionadoBusca')}
                </p>

                <button
                  type="button"
                  className="btn btn--emerald mt-3 w-full"
                  disabled={!setlistSelecionadaIdEfetiva}
                  onClick={addMovieBySearch}
                >
                  {t('filmes.setlistPagina.confirmarAdicionarFilme')}
                </button>
              </div>
            </section>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn--slate inline-flex items-center gap-2"
              onClick={() => {
                try {
                  const usuarioKey = getUsuarioAtualKey()
                  const setlistState = useSetlistStore.getState()
                  const watchlistState = useWatchlistStore.getState()
                  const favoriteState = useFavoriteStore.getState()

                  const dadosExportaveis = createExportableUserData({
                    setlists: setlistState.setlistsPorUsuario[usuarioKey] ?? [],
                    watchlist: watchlistState.watchlistPorUsuario[usuarioKey] ?? {
                      filmesWatchlistIds: [],
                      filmesAssistidosIds: [],
                    },
                    favoritos: favoriteState.favoritosPorUsuario[usuarioKey] ?? [],
                  })

                  exportUserDataAsJson(dadosExportaveis)
                  showSuccess(t('filmes.setlistPagina.dadosJson.exportSucesso'))
                } catch {
                  showError(t('filmes.setlistPagina.dadosJson.exportErro'))
                }
              }}
            >
              <FaFileExport size={13} />
              {t('filmes.setlistPagina.dadosJson.exportar')}
            </button>

            <button
              type="button"
              className="btn btn--slate inline-flex items-center gap-2"
              onClick={() => {
                importFileRef.current?.click()
              }}
            >
              <FaFileImport size={13} />
              {t('filmes.setlistPagina.dadosJson.importar')}
            </button>

            <input
              ref={importFileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(evento) => {
                const arquivo = evento.target.files?.[0]

                if (!arquivo) return

                const leitor = new FileReader()

                leitor.onload = () => {
                  const conteudo = leitor.result

                  if (typeof conteudo !== 'string') {
                    showError(t('filmes.setlistPagina.dadosJson.importErro'))
                    return
                  }

                  const resultado = parseImportedJson(conteudo)

                  if (!resultado.sucesso || !resultado.dados) {
                    showError(t('filmes.setlistPagina.dadosJson.importFormatoInvalido'))
                    return
                  }

                  const usuarioKey = getUsuarioAtualKey()

                  useSetlistStore.setState((estadoAtual) => ({
                    setlistsPorUsuario: {
                      ...estadoAtual.setlistsPorUsuario,
                      [usuarioKey]: resultado.dados.setlists,
                    },
                    setlists: resultado.dados.setlists,
                  }))

                  useWatchlistStore.setState((estadoAtual) => ({
                    watchlistPorUsuario: {
                      ...estadoAtual.watchlistPorUsuario,
                      [usuarioKey]: {
                        filmesWatchlistIds: resultado.dados.watchlist.filmesWatchlistIds,
                        filmesAssistidosIds: resultado.dados.watchlist.filmesAssistidosIds,
                      },
                    },
                    filmesWatchlistIds: resultado.dados.watchlist.filmesWatchlistIds,
                    filmesAssistidosIds: resultado.dados.watchlist.filmesAssistidosIds,
                  }))

                  useFavoriteStore.setState((estadoAtual) => ({
                    favoritosPorUsuario: {
                      ...estadoAtual.favoritosPorUsuario,
                      [usuarioKey]: resultado.dados.favoritos,
                    },
                    filmesFavoritosIds: resultado.dados.favoritos,
                  }))

                  showSuccess(t('filmes.setlistPagina.dadosJson.importSucesso'))
                }

                leitor.onerror = () => {
                  showError(t('filmes.setlistPagina.dadosJson.importErro'))
                }

                leitor.readAsText(arquivo)

                evento.target.value = ''
              }}
            />
          </div>

          <section className="mt-5 rounded-xl border border-slate-200 bg-white/65 p-4 dark:border-slate-700 dark:bg-slate-950/25">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-900 dark:text-slate-100">
                  {t('filmes.setlistPagina.analise.titulo')}
                </h3>

                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  {t('filmes.setlistPagina.analise.descricao')}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn--slate"
                  disabled={
                    isCalculandoAnalise ||
                    statusAnalise === 'semSetlist' ||
                    statusAnalise === 'semFilmes'
                  }
                  onClick={() => {
                    calcularAnalise()
                  }}
                >
                  {isCalculandoAnalise
                    ? t('filmes.setlistPagina.analise.acoes.calculando')
                    : statusAnalise === 'desatualizada'
                      ? t('filmes.setlistPagina.analise.acoes.recalcular')
                      : t('filmes.setlistPagina.analise.acoes.calcular')}
                </button>

                <button
                  type="button"
                  className="btn btn--emerald"
                  disabled={!analiseParaExibir || !canExport}
                  onClick={exportAnalysisCsv}
                >
                  {t('filmes.setlistPagina.analise.acoes.exportarExcel')}
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={getStatusAnaliseClassName()}>{getStatusAnaliseLabel()}</span>

              {calculadoEmReferencia ? (
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  {t('filmes.setlistPagina.analise.ultimaAtualizacao')}:{' '}
                  {formatadorDataHora.format(calculadoEmReferencia)}
                </span>
              ) : null}
            </div>

            {erroCalculoAnalise ? (
              <p className="mt-3 text-sm text-rose-700 dark:text-rose-300">{erroCalculoAnalise}</p>
            ) : null}

            {analiseParaExibir ? (
              <>
                <div className="mt-4">
                  <SetlistAnalysisDashboard
                    analise={analiseParaExibir}
                    routeLanguage={lang}
                  />
                </div>

                <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                  {t('filmes.setlistPagina.analise.insights.resumo', {
                    totalFilmes: analiseParaExibir.totalFilmes,
                    filmesAcimaNotaSete: analiseParaExibir.filmesAcimaNotaSete,
                    filmesBaixaPopularidade: analiseParaExibir.filmesBaixaPopularidade,
                  })}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {t(`filmes.setlistPagina.analise.hints.${statusAnalise}`)}
              </p>
            )}
          </section>

          {erroFilmesSetlistMensagem ? (
            <p className="mt-4 text-sm text-rose-700 dark:text-rose-300">
              {erroFilmesSetlistMensagem}
            </p>
          ) : null}

          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              {t('filmes.modais.setlist.listaFilmes')}
            </p>

            {carregandoFilmesSetlist ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {t('filmes.setlistPagina.carregandoFilmes')}
              </p>
            ) : (
              <SetlistMovieListTable
                movies={filmesSetlistSelecionada}
                emptyMessage={t('filmes.modais.setlist.listaVazia')}
                movieHeaderLabel={t('filmes.modais.colunas.filme')}
                genresHeaderLabel={t('filmes.modais.colunas.generos')}
                actionsHeaderLabel={t('filmes.modais.colunas.acoes')}
                analysisData={analiseParaExibir?.filmes}
                analysisColumnLabels={analiseParaExibir ? {
                  nota: t('filmes.tabelaAnalise.nota'),
                  popularidade: t('filmes.tabelaAnalise.popularidade'),
                  budget: t('filmes.tabelaAnalise.budget'),
                  ano: t('filmes.tabelaAnalise.ano'),
                  trending: t('filmes.tabelaAnalise.trending'),
                } : undefined}
                formatBudget={(valor) => formatadorMoedaCompacto.format(valor)}
                renderActions={(filmeAtual) => (
                  <div className="flex flex-wrap items-center gap-2">
                    <ActionIconButton
                      size="sm"
                      tooltip={
                        filmeAtual.isFavorite
                          ? t('filmes.acoes.desfavoritar')
                          : t('filmes.acoes.favoritar')
                      }
                      colorClassName="hover:border-amber-400 hover:bg-amber-500 hover:text-white"
                      onClick={() => {
                        toggleMovieFavorite(filmeAtual)
                      }}
                    >
                      {filmeAtual.isFavorite ? <FaHeart size={13} /> : <FaRegHeart size={13} />}
                    </ActionIconButton>

                    <ActionIconButton
                      size="sm"
                      tooltip={t('filmes.setlistPagina.abrirModalWatchlist')}
                      colorClassName="hover:border-indigo-400 hover:bg-indigo-600 hover:text-white"
                      onClick={() => {
                        setMovieIdWatchlistModal(filmeAtual.id)
                      }}
                    >
                      <FaBookmark size={13} />
                    </ActionIconButton>

                    <ActionIconButton
                      size="sm"
                      tooltip={
                        isWatched(filmeAtual.id)
                          ? t('filmes.acoes.desmarcarAssistido')
                          : t('filmes.acoes.marcarAssistido')
                      }
                      colorClassName="hover:border-emerald-400 hover:bg-emerald-600 hover:text-white"
                      onClick={() => {
                        setWatched(filmeAtual.id, !isWatched(filmeAtual.id))
                      }}
                    >
                      {isWatched(filmeAtual.id) ? (
                        <FaCircleCheck size={13} />
                      ) : (
                        <FaRegCircleCheck size={13} />
                      )}
                    </ActionIconButton>

                    <ActionIconButton
                      size="sm"
                      tooltip={t('filmes.modais.setlist.removerLinha')}
                      colorClassName="hover:border-rose-400 hover:bg-rose-600 hover:text-white"
                      onClick={() => {
                        removeMovie(filmeAtual)
                      }}
                    >
                      <FaTrash size={12} />
                    </ActionIconButton>
                  </div>
                )}
              />
            )}
          </div>
        </section>
    </SystemPageShell>
  )
}
