import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaFilm, FaRotateLeft } from 'react-icons/fa6'
import type { Movie } from '../../../entities/movie/model/types'
import type { EstadoUsuarioFilmesSnapshot } from '../../../entities/user/model/user-movie-state.types'
import type { JanelaTendencia, OrdenacaoDescoberta } from '../../../shared/api/tmdb'
import { appSettings } from '../../../shared/config/app-settings'
import type { RouteLanguage } from '../../../shared/config/language'
import { useDebouncedValue } from '../../../shared/hooks/use-debounced-value'
import { MovieCardsGrid } from './movie-cards-grid'
import { MovieGenresMultiselect } from './movie-genres-multiselect'
import { MoviesPaginationControls } from './movies-pagination-controls'
import { useMoviesDashboard } from '../hooks/use-movies-dashboard.ts'
import {
  MOVIES_LISTING_VIEWS,
  type MovieListingFilters,
  type MovieListingView,
} from '../model/movies-dashboard.types'
import { parseAno } from '../model/movies-dashboard-utils'
import { selectMovieById } from '../../../entities/movie/model/selectors'

interface MoviesListingPanelProps {
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

const ORDENACAO_PADRAO: OrdenacaoDescoberta = 'popularity.desc'
const JANELA_TENDENCIA_PADRAO: JanelaTendencia = 'week'
const ANO_LANCAMENTO_MINIMO = appSettings.filmes.anoLancamentoMinimo
const ANO_LANCAMENTO_MAXIMO = appSettings.filmes.anoLancamentoMaximo
const NOTA_MINIMA_PERMITIDA = appSettings.filmes.notaMinimaPermitida
const NOTA_MAXIMA_PERMITIDA = appSettings.filmes.notaMaximaPermitida

function parseNotaMinimaTexto(notaTexto: string): number | null {
  const notaNormalizada = notaTexto.trim()

  if (!notaNormalizada) {
    return null
  }

  const notaNumero = Number(notaNormalizada)

  if (
    !Number.isFinite(notaNumero) ||
    notaNumero < NOTA_MINIMA_PERMITIDA ||
    notaNumero > NOTA_MAXIMA_PERMITIDA
  ) {
    return null
  }

  return notaNumero
}

export function MoviesListingPanel({
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
  setlistDestaqueMovieIds = [],
  nomeSetlistDestaque,
}: MoviesListingPanelProps) {
  const { t } = useTranslation()

  const abasDisponiveis =
    viewsDisponiveis && viewsDisponiveis.length > 0
      ? viewsDisponiveis
      : MOVIES_LISTING_VIEWS

  const viewInicialResolvida =
    viewInicial && abasDisponiveis.includes(viewInicial)
      ? viewInicial
      : abasDisponiveis[0]

  const [viewAtiva, setViewAtiva] = useState<MovieListingView>(viewInicialResolvida)
  const [termoBuscaInput, setTermoBuscaInput] = useState('')
  const [generosIdsSelecionados, setGenerosIdsSelecionados] = useState<number[]>([])
  const [anoLancamentoInicialInput, setAnoLancamentoInicialInput] = useState('')
  const [notaMinimaInput, setNotaMinimaInput] = useState('')
  const [regiaoSelecionada, setRegiaoSelecionada] = useState('')
  const [janelaTendencia, setJanelaTendencia] = useState<JanelaTendencia>(
    JANELA_TENDENCIA_PADRAO,
  )
  const [ordenacaoDescoberta, setOrdenacaoDescoberta] =
    useState<OrdenacaoDescoberta>(ORDENACAO_PADRAO)
  const [paginaAtual, setPaginaAtual] = useState(1)

  const termoBuscaDebounced = useDebouncedValue(
    termoBuscaInput,
    appSettings.filmes.tempoDebounceFiltrosMs,
  )

  const viewTendenciasAtiva = viewAtiva === 'tendencias'
  const viewDescobertaAtiva = viewAtiva === 'descoberta'
  const viewPesquisaAtiva = viewAtiva === 'pesquisa'
  const viewRegionalAtiva = !viewTendenciasAtiva
  const viewListagemRegionalAtiva =
    viewAtiva === 'populares' ||
    viewAtiva === 'bemAvaliados' ||
    viewAtiva === 'proximosLancamentos'

  const erroPeriodoLancamento = useMemo(() => {
    if (!viewDescobertaAtiva) {
      return null
    }

    if (!anoLancamentoInicialInput.trim()) {
      return null
    }

    return parseAno(anoLancamentoInicialInput)
      ? null
      : t('filmes.filtros.erroAnoInvalido')
  }, [
    viewDescobertaAtiva,
    anoLancamentoInicialInput,
    t,
  ])

  const erroAnoPesquisa = useMemo(() => {
    if (!viewPesquisaAtiva) {
      return null
    }

    if (!anoLancamentoInicialInput.trim()) {
      return null
    }

    return parseAno(anoLancamentoInicialInput)
      ? null
      : t('filmes.filtros.erroAnoInvalido')
  }, [viewPesquisaAtiva, anoLancamentoInicialInput, t])

  const erroNotaMinima = useMemo(() => {
    if (!viewDescobertaAtiva) {
      return null
    }

    if (!notaMinimaInput.trim()) {
      return null
    }

    return parseNotaMinimaTexto(notaMinimaInput) !== null
      ? null
      : t('filmes.filtros.erroNotaInvalida')
  }, [viewDescobertaAtiva, notaMinimaInput, t])

  const filtrosAplicados = useMemo<MovieListingFilters>(() => {
    const anoInicialAplicado = viewDescobertaAtiva || viewPesquisaAtiva
      ? erroPeriodoLancamento || erroAnoPesquisa
        ? ''
        : anoLancamentoInicialInput.trim()
      : ''

    return {
      termoBusca: viewPesquisaAtiva ? termoBuscaDebounced.trim() : '',
      generosIds: viewDescobertaAtiva ? generosIdsSelecionados : [],
      anoLancamentoInicial: anoInicialAplicado,
      notaMinima:
        viewDescobertaAtiva && !erroNotaMinima
          ? notaMinimaInput.trim()
          : '',
      regiao: viewRegionalAtiva ? regiaoSelecionada : '',
      janelaTendencia,
      ordenacaoDescoberta,
    }
  }, [
    viewPesquisaAtiva,
    viewDescobertaAtiva,
    viewRegionalAtiva,
    termoBuscaDebounced,
    generosIdsSelecionados,
    anoLancamentoInicialInput,
    notaMinimaInput,
    regiaoSelecionada,
    janelaTendencia,
    ordenacaoDescoberta,
    erroPeriodoLancamento,
    erroAnoPesquisa,
    erroNotaMinima,
  ])

  const filtrosRascunhoAtivos =
    (viewPesquisaAtiva &&
      (Boolean(termoBuscaInput.trim()) ||
        Boolean(anoLancamentoInicialInput.trim()) ||
        Boolean(regiaoSelecionada))) ||
    (viewDescobertaAtiva &&
      (generosIdsSelecionados.length > 0 ||
        Boolean(anoLancamentoInicialInput.trim()) ||
        Boolean(notaMinimaInput.trim()) ||
        Boolean(regiaoSelecionada) ||
        ordenacaoDescoberta !== ORDENACAO_PADRAO)) ||
    (viewTendenciasAtiva && janelaTendencia !== JANELA_TENDENCIA_PADRAO) ||
    (viewListagemRegionalAtiva && Boolean(regiaoSelecionada))

  const {
    filmes,
    paginacao,
    isLoading,
    errorMessage,
    generosDisponiveis,
    hasGenreFilter,
    genreErrorMessage,
    catalogoFilmes,
    filmesWatchlist,
  } = useMoviesDashboard({
    viewAtiva,
    filtros: filtrosAplicados,
    paginaAtual,
    routeLanguage,
    estadoUsuario,
  })

  useEffect(() => {
    onCatalogChange?.(catalogoFilmes, filmesWatchlist)
  }, [catalogoFilmes, filmesWatchlist, onCatalogChange])

  const erroFiltros = erroPeriodoLancamento || erroAnoPesquisa || erroNotaMinima

  return (
    <section className="mt-6 rounded-2xl border border-slate-200/90 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
      <div className="flex items-center gap-3">
        <span className="badge-chip badge-chip--slate">{t('filmes.listagem.badge')}</span>
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
          <FaFilm className="text-cyan-700 dark:text-cyan-300" />
          {t('filmes.listagem.titulo')}
        </h2>
      </div>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {t('filmes.listagem.descricao')}
      </p>

      {abasDisponiveis.length > 1 ? (
        <div className="mt-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap">
            {abasDisponiveis.map((viewAtual, indice) => {
              const abaAtiva = viewAtiva === viewAtual
              const ultimaAba = indice === abasDisponiveis.length - 1

              return (
                <button
                  key={viewAtual}
                  role="tab"
                  aria-selected={abaAtiva}
                  type="button"
                  className={`relative -mb-px border px-4 py-2 text-sm font-semibold transition ${
                    indice > 0 ? '-ml-px' : ''
                  } ${
                    indice === 0 ? 'rounded-tl-lg' : ''
                  } ${
                    ultimaAba ? 'rounded-tr-lg' : ''
                  } ${
                    abaAtiva
                      ? 'z-10 border-slate-300 border-b-white bg-white text-slate-900 dark:border-slate-600 dark:border-b-slate-900 dark:bg-slate-900 dark:text-slate-100'
                      : 'border-slate-300 bg-slate-100/80 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => {
                    setPaginaAtual(1)
                    setViewAtiva(viewAtual)
                  }}
                >
                  {t(`filmes.abas.${viewAtual}`)}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      <div
        className={`border border-slate-300 bg-white/50 p-4 dark:border-slate-700 dark:bg-slate-950/20 ${
          abasDisponiveis.length > 1 ? 'rounded-b-xl border-t-0' : 'rounded-xl'
        }`}
      >
        <p className="mb-4 text-xs text-slate-700 dark:text-slate-300">
          {t(`filmes.abasDescricao.${viewAtiva}`)}
        </p>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          {viewPesquisaAtiva ? (
            <div>
              <label htmlFor="filmes-termo-busca">{t('filmes.filtros.tituloBusca')}</label>
              <input
                id="filmes-termo-busca"
                value={termoBuscaInput}
                placeholder={t('filmes.filtros.placeholderBusca')}
                onChange={(evento) => {
                  setPaginaAtual(1)
                  setTermoBuscaInput(evento.target.value)
                }}
              />
            </div>
          ) : null}

          {viewDescobertaAtiva ? (
            <div>
              {hasGenreFilter ? (
                <MovieGenresMultiselect
                  options={generosDisponiveis}
                  selectedIds={generosIdsSelecionados}
                  onChange={(valoresSelecionados) => {
                    setPaginaAtual(1)
                    setGenerosIdsSelecionados(valoresSelecionados)
                  }}
                  label={t('filmes.filtros.tituloGenero')}
                  placeholder={t('filmes.filtros.placeholderGenero')}
                  emptyOptionsLabel={t('filmes.filtros.nenhumGeneroEncontrado')}
                />
              ) : (
                <div>
                  <label>{t('filmes.filtros.tituloGenero')}</label>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                    {genreErrorMessage || t('filmes.filtros.generoIndisponivel')}
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {(viewDescobertaAtiva || viewPesquisaAtiva) ? (
            <div>
              <label htmlFor="filmes-ano-inicial">
                {t('filmes.filtros.anoLancamento')}
              </label>
              <input
                id="filmes-ano-inicial"
                type="number"
                inputMode="numeric"
                min={ANO_LANCAMENTO_MINIMO}
                max={ANO_LANCAMENTO_MAXIMO}
                placeholder={t('filmes.filtros.placeholderAno')}
                value={anoLancamentoInicialInput}
                onChange={(evento) => {
                  setPaginaAtual(1)
                  setAnoLancamentoInicialInput(evento.target.value)
                }}
              />
            </div>
          ) : null}

          {viewDescobertaAtiva ? (
            <div>
              <label htmlFor="filmes-nota-minima">{t('filmes.filtros.tituloNotaMinima')}</label>
              <input
                id="filmes-nota-minima"
                type="number"
                inputMode="decimal"
                min={NOTA_MINIMA_PERMITIDA}
                max={NOTA_MAXIMA_PERMITIDA}
                step={0.1}
                placeholder={t('filmes.filtros.placeholderNotaMinima')}
                value={notaMinimaInput}
                onChange={(evento) => {
                  setPaginaAtual(1)
                  setNotaMinimaInput(evento.target.value)
                }}
              />
            </div>
          ) : null}

          {viewTendenciasAtiva ? (
            <div>
              <label htmlFor="filmes-janela-tendencia">
                {t('filmes.filtros.tituloJanelaTendencia')}
              </label>
              <select
                id="filmes-janela-tendencia"
                value={janelaTendencia}
                onChange={(evento) => {
                  setPaginaAtual(1)
                  setJanelaTendencia(evento.target.value as JanelaTendencia)
                }}
              >
                <option value="day">{t('filmes.filtros.tendenciaDia')}</option>
                <option value="week">{t('filmes.filtros.tendenciaSemana')}</option>
              </select>
            </div>
          ) : null}

          {viewRegionalAtiva ? (
            <div>
              <label htmlFor="filmes-regiao">{t('filmes.filtros.tituloRegiao')}</label>
              <select
                id="filmes-regiao"
                value={regiaoSelecionada}
                onChange={(evento) => {
                  setPaginaAtual(1)
                  setRegiaoSelecionada(evento.target.value)
                }}
              >
                <option value="">{t('filmes.filtros.regiaoTodos')}</option>
                <option value="BR">{t('filmes.filtros.regiaoBrasil')}</option>
                <option value="US">{t('filmes.filtros.regiaoEstadosUnidos')}</option>
              </select>
            </div>
          ) : null}

          {viewDescobertaAtiva ? (
            <div>
              <label htmlFor="filmes-ordenacao">{t('filmes.filtros.tituloOrdenacao')}</label>
              <select
                id="filmes-ordenacao"
                value={ordenacaoDescoberta}
                onChange={(evento) => {
                  setPaginaAtual(1)
                  setOrdenacaoDescoberta(evento.target.value as OrdenacaoDescoberta)
                }}
              >
                <option value="popularity.desc">
                  {t('filmes.filtros.ordenacaoPopularidadeDesc')}
                </option>
                <option value="popularity.asc">
                  {t('filmes.filtros.ordenacaoPopularidadeAsc')}
                </option>
                <option value="primary_release_date.desc">
                  {t('filmes.filtros.ordenacaoDataDesc')}
                </option>
                <option value="primary_release_date.asc">
                  {t('filmes.filtros.ordenacaoDataAsc')}
                </option>
                <option value="vote_average.desc">
                  {t('filmes.filtros.ordenacaoNotaDesc')}
                </option>
                <option value="vote_average.asc">
                  {t('filmes.filtros.ordenacaoNotaAsc')}
                </option>
              </select>
            </div>
          ) : null}

          <div className="flex items-end justify-end md:col-span-2 xl:col-span-1">
            <div className="group/clear relative">
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:border-amber-500 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-amber-400 dark:hover:text-amber-300"
                aria-label={t('filmes.filtros.limparFiltros')}
                disabled={!filtrosRascunhoAtivos}
                onClick={() => {
                  setPaginaAtual(1)
                  setTermoBuscaInput('')
                  setGenerosIdsSelecionados([])
                  setAnoLancamentoInicialInput('')
                  setNotaMinimaInput('')
                  setRegiaoSelecionada('')
                  setJanelaTendencia(JANELA_TENDENCIA_PADRAO)
                  setOrdenacaoDescoberta(ORDENACAO_PADRAO)
                }}
              >
                <FaRotateLeft size={13} />
              </button>

              <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 rounded-md bg-slate-950/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-100 opacity-0 transition duration-200 group-hover/clear:opacity-100">
                {t('filmes.filtros.limparFiltros')}
              </span>
            </div>
          </div>
        </div>

        {erroFiltros ? (
          <p className="mt-3 text-sm text-rose-700 dark:text-rose-300">{erroFiltros}</p>
        ) : null}

        {errorMessage ? (
          <p className="mt-3 text-sm text-rose-700 dark:text-rose-300">{errorMessage}</p>
        ) : null}

        <MovieCardsGrid
          movies={filmes}
          isLoading={isLoading}
          emptyMessage={t('filmes.listaVazia')}
          setlistDestaqueMovieIds={setlistDestaqueMovieIds}
          nomeSetlistDestaque={nomeSetlistDestaque}
          labels={{
            favorite: t('filmes.acoes.favoritar'),
            unfavorite: t('filmes.acoes.desfavoritar'),
            setlist: t('filmes.acoes.setlist'),
            addWatchlist: t('filmes.acoes.adicionarWatchlist'),
            removeWatchlist: t('filmes.acoes.removerWatchlist'),
            markWatched: t('filmes.acoes.marcarAssistido'),
            unmarkWatched: t('filmes.acoes.desmarcarAssistido'),
            details: t('filmes.acoes.verDetalhes'),
            noImage: t('filmes.semImagem'),
            indicadorFavoritado: t('filmes.indicadores.favoritado'),
            indicadorAssistido: t('filmes.indicadores.assistido'),
            indicadorNaSetlist: t('filmes.indicadores.naSetlist'),
            maisSetlists: t('filmes.indicadores.maisSetlists'),
          }}
          onOpenDetails={onOpenDetails}
          onToggleFavorite={onToggleFavorite}
          onOpenSetlistModal={(movieId) => {
            const movieSelecionado = selectMovieById(catalogoFilmes, movieId)

            if (movieSelecionado) {
              onOpenSetlistModal?.(movieSelecionado)
            }
          }}
          onOpenWatchlistModal={(movieId) => {
            const movieSelecionado = selectMovieById(catalogoFilmes, movieId)

            if (movieSelecionado) {
              onOpenWatchlistModal?.(movieSelecionado)
            }
          }}
          onToggleWatched={onToggleWatched}
        />

        <MoviesPaginationControls
          paginaAtual={paginacao.paginaAtual}
          totalPaginas={paginacao.totalPaginas}
          totalResultados={paginacao.totalResultados}
          isLoading={isLoading}
          onChangePage={(proximaPagina) => {
            setPaginaAtual(proximaPagina)
          }}
        />
      </div>
    </section>
  )
}
