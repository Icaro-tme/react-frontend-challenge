import { appSettings } from '../../config/app-settings'
import { createTmdbGetClient } from './tmdb.client'
import type {
  BuscarClassificacoesFilmeParams,
  BuscarDetalhesFilmeParams,
  BuscarFilmesBuscaParams,
  BuscarFilmesDescobertaParams,
  BuscarFilmesPopularesParams,
  BuscarFilmesTopRatedParams,
  BuscarFilmesTendenciaParams,
  BuscarFilmesUpcomingParams,
  BuscarGenerosFilmeParams,
  TmdbClientDependencias,
  TmdbGenreListResponse,
  TmdbMovieDetailsResponse,
  TmdbMovieListResponse,
  TmdbMovieReleaseDatesResponse,
} from './tmdb.types'

const IDIOMA_PADRAO = appSettings.idioma.idiomaPadrao

function resolveRequestLanguage(idiomaRequest?: string): string {
  return idiomaRequest ?? IDIOMA_PADRAO
}

export function createTmdbService(dependencias: TmdbClientDependencias = {}) {
  const cliente = createTmdbGetClient(dependencias)

  async function getTrendingMovies(
    filtros: BuscarFilmesTendenciaParams = {},
  ): Promise<TmdbMovieListResponse> {
    const { timeWindow = 'day', page = 1, language } = filtros

    return cliente.get<TmdbMovieListResponse>(`/trending/movie/${timeWindow}`, {
      page,
      language: resolveRequestLanguage(language),
    })
  }

  async function getPopularMovies(
    filtros: BuscarFilmesPopularesParams = {},
  ): Promise<TmdbMovieListResponse> {
    const { page = 1, language, region } = filtros

    return cliente.get<TmdbMovieListResponse>('/movie/popular', {
      page,
      language: resolveRequestLanguage(language),
      region,
    })
  }

  async function getTopRatedMovies(
    filtros: BuscarFilmesTopRatedParams = {},
  ): Promise<TmdbMovieListResponse> {
    const { page = 1, language, region } = filtros

    return cliente.get<TmdbMovieListResponse>('/movie/top_rated', {
      page,
      language: resolveRequestLanguage(language),
      region,
    })
  }

  async function getUpcomingMovies(
    filtros: BuscarFilmesUpcomingParams = {},
  ): Promise<TmdbMovieListResponse> {
    const { page = 1, language, region } = filtros

    return cliente.get<TmdbMovieListResponse>('/movie/upcoming', {
      page,
      language: resolveRequestLanguage(language),
      region,
    })
  }

  async function getDiscoverMovies(
    filtros: BuscarFilmesDescobertaParams = {},
  ): Promise<TmdbMovieListResponse> {
    const {
      page = 1,
      language,
      region,
      generos,
      dataLancamentoInicial,
      dataLancamentoFinal,
      anoLancamento,
      notaMinima,
      ordenacao = 'popularity.desc',
    } = filtros

    return cliente.get<TmdbMovieListResponse>('/discover/movie', {
      include_adult: false,
      include_video: false,
      sort_by: ordenacao,
      page,
      language: resolveRequestLanguage(language),
      region,
      with_genres: generos,
      'primary_release_date.gte': dataLancamentoInicial,
      'primary_release_date.lte': dataLancamentoFinal,
      primary_release_year: anoLancamento,
      'vote_average.gte': notaMinima,
    })
  }

  async function getMovieDetails(
    filtros: BuscarDetalhesFilmeParams,
  ): Promise<TmdbMovieDetailsResponse> {
    const { movieId, language, appendToResponse } = filtros

    const appendToResponseParam =
      appendToResponse && appendToResponse.length > 0
        ? appendToResponse.join(',')
        : undefined

    return cliente.get<TmdbMovieDetailsResponse>(`/movie/${movieId}`, {
      language: resolveRequestLanguage(language),
      append_to_response: appendToResponseParam,
    })
  }

  async function getMovieReleaseDates(
    filtros: BuscarClassificacoesFilmeParams,
  ): Promise<TmdbMovieReleaseDatesResponse> {
    const { movieId, language } = filtros

    return cliente.get<TmdbMovieReleaseDatesResponse>(`/movie/${movieId}/release_dates`, {
      language: resolveRequestLanguage(language),
    })
  }

  async function searchMovies(
    filtros: BuscarFilmesBuscaParams,
  ): Promise<TmdbMovieListResponse> {
    const {
      query,
      page = 1,
      anoLancamento,
      anoLancamentoPrimario,
      region,
      includeAdult = false,
      language,
    } = filtros

    return cliente.get<TmdbMovieListResponse>('/search/movie', {
      query,
      page,
      year: anoLancamento,
      primary_release_year: anoLancamentoPrimario,
      region,
      include_adult: includeAdult,
      language: resolveRequestLanguage(language),
    })
  }

  async function getMovieGenres(
    filtros: BuscarGenerosFilmeParams = {},
  ): Promise<TmdbGenreListResponse> {
    const { language } = filtros

    return cliente.get<TmdbGenreListResponse>('/genre/movie/list', {
      language: resolveRequestLanguage(language),
    })
  }

  return {
    getTrendingMovies,
    getPopularMovies,
    getTopRatedMovies,
    getUpcomingMovies,
    getDiscoverMovies,
    getMovieDetails,
    getMovieReleaseDates,
    searchMovies,
    getMovieGenres,
  }
}

export const tmdbService = createTmdbService()