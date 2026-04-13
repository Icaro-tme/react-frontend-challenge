import type { RouteLanguage } from '../../../shared/config/language'
import {
  useDiscoverMoviesQuery,
  useMovieGenresQuery,
  usePopularMoviesQuery,
  useSearchMoviesQuery,
  useTopRatedMoviesQuery,
  useTrendingMoviesQuery,
  useUpcomingMoviesQuery,
} from '../../../entities/movie/api/movie.query'
import type { MovieListingView } from '../model/movies-dashboard.types'
import {
  buildDataFinal,
  buildDataInicial,
  resolveAnoBusca,
} from '../model/movies-dashboard-utils'
import type { JanelaTendencia, OrdenacaoDescoberta } from '../../../shared/api/tmdb'

interface UseMoviesDashboardQueriesInput {
  viewAtiva: MovieListingView
  termoBusca: string
  generosIds: number[]
  anoLancamentoInicial: string
  notaMinima?: number
  regiao?: string
  janelaTendencia: JanelaTendencia
  ordenacaoDescoberta: OrdenacaoDescoberta
  paginaAtual: number
  routeLanguage: RouteLanguage
}

export function useMoviesDashboardQueries({
  viewAtiva,
  termoBusca,
  generosIds,
  anoLancamentoInicial,
  notaMinima,
  regiao,
  janelaTendencia,
  ordenacaoDescoberta,
  paginaAtual,
  routeLanguage,
}: UseMoviesDashboardQueriesInput) {
  const viewDescobertaAtiva = viewAtiva === 'descoberta'
  const viewPesquisaAtiva = viewAtiva === 'pesquisa'
  const termoBuscaAtivo = termoBusca.length > 0
  const paginaQuery = paginaAtual
  const generosParametro = generosIds.length > 0 ? generosIds.join('|') : undefined
  const anoBusca = resolveAnoBusca(anoLancamentoInicial)
  const regiaoParametro = regiao?.trim() ? regiao : undefined

  const tendenciaQuery = useTrendingMoviesQuery(
    {
      routeLanguage,
      page: paginaQuery,
      timeWindow: janelaTendencia,
    },
    {
      enabled: viewAtiva === 'tendencias',
    },
  )

  const popularesQuery = usePopularMoviesQuery(
    {
      routeLanguage,
      page: paginaQuery,
      region: regiaoParametro,
    },
    {
      enabled: viewAtiva === 'populares',
    },
  )

  const bemAvaliadosQuery = useTopRatedMoviesQuery(
    {
      routeLanguage,
      page: paginaQuery,
      region: regiaoParametro,
    },
    {
      enabled: viewAtiva === 'bemAvaliados',
    },
  )

  const proximosLancamentosQuery = useUpcomingMoviesQuery(
    {
      routeLanguage,
      page: paginaQuery,
      region: regiaoParametro,
    },
    {
      enabled: viewAtiva === 'proximosLancamentos',
    },
  )

  const descobertaQuery = useDiscoverMoviesQuery(
    {
      routeLanguage,
      page: paginaQuery,
      region: regiaoParametro,
      generos: viewDescobertaAtiva ? generosParametro : undefined,
      dataLancamentoInicial: viewDescobertaAtiva
        ? buildDataInicial(anoLancamentoInicial)
        : undefined,
      dataLancamentoFinal: viewDescobertaAtiva
        ? buildDataFinal(anoLancamentoInicial)
        : undefined,
      anoLancamento: viewDescobertaAtiva ? anoBusca : undefined,
      notaMinima: viewDescobertaAtiva ? notaMinima : undefined,
      ordenacao: ordenacaoDescoberta,
    },
    {
      enabled: viewDescobertaAtiva,
    },
  )

  const buscaQuery = useSearchMoviesQuery(
    {
      routeLanguage,
      query: termoBusca,
      page: paginaAtual,
      anoLancamento: viewPesquisaAtiva ? anoBusca : undefined,
      anoLancamentoPrimario: viewPesquisaAtiva ? anoBusca : undefined,
      region: regiaoParametro,
    },
    {
      enabled: viewPesquisaAtiva && termoBuscaAtivo,
    },
  )

  const generosQuery = useMovieGenresQuery({ routeLanguage })

  return {
    viewDescobertaAtiva,
    viewPesquisaAtiva,
    termoBuscaAtivo,
    tendenciaQuery,
    popularesQuery,
    bemAvaliadosQuery,
    proximosLancamentosQuery,
    descobertaQuery,
    buscaQuery,
    generosQuery,
  }
}
