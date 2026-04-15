import { useMemo } from 'react'
import { buildMovieGenresById } from '../../../entities/movie/model/genres'
import { getErrorMessage as getSharedErrorMessage } from '../../../shared/lib/get-error-message'
import type { EstadoUsuarioFilmesSnapshot } from '../../../entities/user/model/user-movie-state.types'
import type { RouteLanguage } from '../../../shared/config/language'
import type {
  MovieListingFilters,
  MovieListingView,
} from '../model/movies-dashboard.types'
import {
  limitarTotalPaginas,
  parseNotaMinima,
} from '../model/movies-dashboard-utils'
import { useMoviesDashboardCatalog } from './use-movies-dashboard-catalog'
import { useMoviesDashboardQueries } from './use-movies-dashboard-queries'

interface UseMoviesDashboardInput {
  viewAtiva: MovieListingView
  filtros: MovieListingFilters
  paginaAtual: number
  routeLanguage: RouteLanguage
  estadoUsuario: EstadoUsuarioFilmesSnapshot
}

interface PaginacaoListagem {
  paginaAtual: number
  totalPaginas: number
  totalResultados: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

function getErrorMessage(erro: unknown): string {
  return getSharedErrorMessage(erro, 'Erro ao buscar filmes.')
}

export function useMoviesDashboard({
  viewAtiva,
  filtros,
  paginaAtual,
  routeLanguage,
  estadoUsuario,
}: UseMoviesDashboardInput) {
  const termoBusca = filtros.termoBusca.trim()
  const notaMinima = parseNotaMinima(filtros.notaMinima)

  const {
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
  } = useMoviesDashboardQueries({
    viewAtiva,
    termoBusca,
    generosIds: filtros.generosIds,
    anoLancamentoInicial: filtros.anoLancamentoInicial,
    notaMinima,
    regiao: filtros.regiao,
    janelaTendencia: filtros.janelaTendencia,
    ordenacaoDescoberta: filtros.ordenacaoDescoberta,
    paginaAtual,
    routeLanguage,
  })

  const genresById = useMemo(
    () => buildMovieGenresById(generosQuery.data?.genres),
    [generosQuery.data?.genres],
  )

  const {
    filmesTendencia,
    filmesPopulares,
    filmesBemAvaliados,
    filmesProximosLancamentos,
    filmesDescoberta,
    filmesBusca,
    catalogoFilmes,
    filmesWatchlist,
  } = useMoviesDashboardCatalog({
    tendenciaData: tendenciaQuery.data,
    popularesData: popularesQuery.data,
    bemAvaliadosData: bemAvaliadosQuery.data,
    proximosLancamentosData: proximosLancamentosQuery.data,
    descobertaData: descobertaQuery.data,
    buscaData: buscaQuery.data,
    estadoUsuario,
    genresById,
  })

  const filmesBaseView = useMemo(() => {
    switch (viewAtiva) {
      case 'tendencias':
        return filmesTendencia
      case 'populares':
        return filmesPopulares
      case 'bemAvaliados':
        return filmesBemAvaliados
      case 'proximosLancamentos':
        return filmesProximosLancamentos
      case 'descoberta':
        return filmesDescoberta
      case 'pesquisa':
        return termoBuscaAtivo ? filmesBusca : []
    }
  }, [
    viewAtiva,
    filmesTendencia,
    filmesPopulares,
    filmesBemAvaliados,
    filmesProximosLancamentos,
    filmesDescoberta,
    filmesBusca,
    termoBuscaAtivo,
  ])

  const totalPaginas = useMemo(() => {
    switch (viewAtiva) {
      case 'tendencias':
        return limitarTotalPaginas(tendenciaQuery.data?.total_pages ?? 1)
      case 'populares':
        return limitarTotalPaginas(popularesQuery.data?.total_pages ?? 1)
      case 'bemAvaliados':
        return limitarTotalPaginas(bemAvaliadosQuery.data?.total_pages ?? 1)
      case 'proximosLancamentos':
        return limitarTotalPaginas(proximosLancamentosQuery.data?.total_pages ?? 1)
      case 'descoberta':
        return limitarTotalPaginas(descobertaQuery.data?.total_pages ?? 1)
      case 'pesquisa':
        return termoBuscaAtivo
          ? limitarTotalPaginas(buscaQuery.data?.total_pages ?? 1)
          : 1
    }
  }, [
    viewAtiva,
    termoBuscaAtivo,
    tendenciaQuery.data?.total_pages,
    popularesQuery.data?.total_pages,
    bemAvaliadosQuery.data?.total_pages,
    proximosLancamentosQuery.data?.total_pages,
    descobertaQuery.data?.total_pages,
    buscaQuery.data?.total_pages,
  ])

  const totalResultados = useMemo(() => {
    switch (viewAtiva) {
      case 'tendencias':
        return tendenciaQuery.data?.total_results ?? 0
      case 'populares':
        return popularesQuery.data?.total_results ?? 0
      case 'bemAvaliados':
        return bemAvaliadosQuery.data?.total_results ?? 0
      case 'proximosLancamentos':
        return proximosLancamentosQuery.data?.total_results ?? 0
      case 'descoberta':
        return descobertaQuery.data?.total_results ?? 0
      case 'pesquisa':
        return termoBuscaAtivo ? buscaQuery.data?.total_results ?? 0 : 0
    }
  }, [
    viewAtiva,
    termoBuscaAtivo,
    tendenciaQuery.data?.total_results,
    popularesQuery.data?.total_results,
    bemAvaliadosQuery.data?.total_results,
    proximosLancamentosQuery.data?.total_results,
    descobertaQuery.data?.total_results,
    buscaQuery.data?.total_results,
  ])

  const isLoading =
    (viewAtiva === 'tendencias' &&
      (tendenciaQuery.isLoading || tendenciaQuery.isFetching)) ||
    (viewAtiva === 'populares' &&
      (popularesQuery.isLoading || popularesQuery.isFetching)) ||
    (viewAtiva === 'bemAvaliados' &&
      (bemAvaliadosQuery.isLoading || bemAvaliadosQuery.isFetching)) ||
    (viewAtiva === 'proximosLancamentos' &&
      (proximosLancamentosQuery.isLoading || proximosLancamentosQuery.isFetching)) ||
    (viewDescobertaAtiva &&
      (descobertaQuery.isLoading || descobertaQuery.isFetching)) ||
    (viewPesquisaAtiva &&
      termoBuscaAtivo &&
      (buscaQuery.isLoading || buscaQuery.isFetching))

  const erroPrincipal =
    (viewAtiva === 'tendencias' && tendenciaQuery.error) ||
    (viewAtiva === 'populares' && popularesQuery.error) ||
    (viewAtiva === 'bemAvaliados' && bemAvaliadosQuery.error) ||
    (viewAtiva === 'proximosLancamentos' && proximosLancamentosQuery.error) ||
    (viewDescobertaAtiva && descobertaQuery.error) ||
    (viewPesquisaAtiva && termoBuscaAtivo && buscaQuery.error)

  const generosDisponiveis = generosQuery.data?.genres ?? []

  const paginacao: PaginacaoListagem = {
    paginaAtual,
    totalPaginas,
    totalResultados,
    hasPreviousPage: paginaAtual > 1,
    hasNextPage: paginaAtual < totalPaginas,
  }

  return {
    filmes: filmesBaseView,
    paginacao,
    isLoading,
    errorMessage: erroPrincipal ? getErrorMessage(erroPrincipal) : null,
    generosDisponiveis,
    hasGenreFilter: viewDescobertaAtiva && generosDisponiveis.length > 0,
    genreErrorMessage: viewDescobertaAtiva && generosQuery.error
      ? getErrorMessage(generosQuery.error)
      : null,
    catalogoFilmes,
    filmesWatchlist,
  }
}
