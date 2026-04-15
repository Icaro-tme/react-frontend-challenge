import { queryOptions, useQuery } from '@tanstack/react-query'
import type { RouteLanguage } from '../../../shared/config/language'
import {
  type MovieDetailsAppendItem,
  type OrdenacaoDescoberta,
  tmdbService,
  type JanelaTendencia,
} from '../../../shared/api/tmdb'

interface ListQueryInput {
  routeLanguage: RouteLanguage
  page?: number
}

interface RegionalListQueryInput extends ListQueryInput {
  region?: string
}

interface TrendingQueryInput extends ListQueryInput {
  timeWindow?: JanelaTendencia
}

interface MovieDetailsQueryInput extends ListQueryInput {
  movieId: number
  appendToResponse?: MovieDetailsAppendItem[]
}

interface MovieReleaseDatesQueryInput extends ListQueryInput {
  movieId: number
}

interface SearchMoviesQueryInput extends ListQueryInput {
  query: string
  anoLancamento?: number
  anoLancamentoPrimario?: number
  region?: string
}

interface DiscoverQueryInput extends RegionalListQueryInput {
  generos?: string
  dataLancamentoInicial?: string
  dataLancamentoFinal?: string
  anoLancamento?: number
  notaMinima?: number
  ordenacao?: OrdenacaoDescoberta
}

interface QueryUsageInput {
  enabled?: boolean
}

export function trendingMoviesQueryOptions({
  routeLanguage,
  timeWindow = 'day',
  page = 1,
}: TrendingQueryInput) {
  return queryOptions({
    queryKey: ['movies', 'trending', routeLanguage, timeWindow, page],
    queryFn: () =>
      tmdbService.getTrendingMovies({
        timeWindow,
        page,
        language: routeLanguage,
      }),
  })
}

export function popularMoviesQueryOptions({
  routeLanguage,
  page = 1,
  region,
}: RegionalListQueryInput) {
  return queryOptions({
    queryKey: ['movies', 'popular', routeLanguage, page, region ?? ''],
    queryFn: () =>
      tmdbService.getPopularMovies({
        page,
        language: routeLanguage,
        region,
      }),
  })
}

export function topRatedMoviesQueryOptions({
  routeLanguage,
  page = 1,
  region,
}: RegionalListQueryInput) {
  return queryOptions({
    queryKey: ['movies', 'top-rated', routeLanguage, page, region ?? ''],
    queryFn: () =>
      tmdbService.getTopRatedMovies({
        page,
        language: routeLanguage,
        region,
      }),
  })
}

export function upcomingMoviesQueryOptions({
  routeLanguage,
  page = 1,
  region,
}: RegionalListQueryInput) {
  return queryOptions({
    queryKey: ['movies', 'upcoming', routeLanguage, page, region ?? ''],
    queryFn: () =>
      tmdbService.getUpcomingMovies({
        page,
        language: routeLanguage,
        region,
      }),
  })
}

export function discoverMoviesQueryOptions({
  routeLanguage,
  page = 1,
  region,
  generos,
  dataLancamentoInicial,
  dataLancamentoFinal,
  anoLancamento,
  notaMinima,
  ordenacao = 'popularity.desc',
}: DiscoverQueryInput) {
  return queryOptions({
    queryKey: [
      'movies',
      'discover',
      routeLanguage,
      page,
      region ?? '',
      generos ?? '',
      dataLancamentoInicial ?? '',
      dataLancamentoFinal ?? '',
      anoLancamento ?? '',
      notaMinima ?? '',
      ordenacao,
    ],
    queryFn: () =>
      tmdbService.getDiscoverMovies({
        page,
        region,
        generos,
        dataLancamentoInicial,
        dataLancamentoFinal,
        anoLancamento,
        notaMinima,
        ordenacao,
        language: routeLanguage,
      }),
  })
}

export function movieDetailsQueryOptions({
  routeLanguage,
  movieId,
  appendToResponse,
}: MovieDetailsQueryInput) {
  const appendToResponseKey = appendToResponse?.join(',') ?? ''

  return queryOptions({
    queryKey: ['movies', 'details', routeLanguage, movieId, appendToResponseKey],
    enabled: movieId > 0,
    queryFn: () =>
      tmdbService.getMovieDetails({
        movieId,
        language: routeLanguage,
        appendToResponse,
      }),
  })
}

export function movieReleaseDatesQueryOptions({
  routeLanguage,
  movieId,
}: MovieReleaseDatesQueryInput) {
  return queryOptions({
    queryKey: ['movies', 'release-dates', routeLanguage, movieId],
    enabled: movieId > 0,
    queryFn: () =>
      tmdbService.getMovieReleaseDates({
        movieId,
        language: routeLanguage,
      }),
  })
}

export function searchMoviesQueryOptions({
  routeLanguage,
  query,
  page = 1,
  anoLancamento,
  anoLancamentoPrimario,
  region,
}: SearchMoviesQueryInput) {
  const queryNormalizada = query.trim()

  return queryOptions({
    queryKey: [
      'movies',
      'search',
      routeLanguage,
      queryNormalizada,
      page,
      anoLancamento ?? '',
      anoLancamentoPrimario ?? '',
      region ?? '',
    ],
    enabled: queryNormalizada.length > 0,
    queryFn: () =>
      tmdbService.searchMovies({
        query: queryNormalizada,
        page,
        anoLancamento,
        anoLancamentoPrimario,
        region,
        language: routeLanguage,
      }),
  })
}

export function movieGenresQueryOptions({ routeLanguage }: ListQueryInput) {
  return queryOptions({
    queryKey: ['movies', 'genres', routeLanguage],
    queryFn: () =>
      tmdbService.getMovieGenres({
        language: routeLanguage,
      }),
  })
}

export function useTrendingMoviesQuery(
  input: TrendingQueryInput,
  { enabled = true }: QueryUsageInput = {},
) {
  return useQuery({
    ...trendingMoviesQueryOptions(input),
    enabled,
  })
}

export function usePopularMoviesQuery(
  input: RegionalListQueryInput,
  { enabled = true }: QueryUsageInput = {},
) {
  return useQuery({
    ...popularMoviesQueryOptions(input),
    enabled,
  })
}

export function useTopRatedMoviesQuery(
  input: RegionalListQueryInput,
  { enabled = true }: QueryUsageInput = {},
) {
  return useQuery({
    ...topRatedMoviesQueryOptions(input),
    enabled,
  })
}

export function useUpcomingMoviesQuery(
  input: RegionalListQueryInput,
  { enabled = true }: QueryUsageInput = {},
) {
  return useQuery({
    ...upcomingMoviesQueryOptions(input),
    enabled,
  })
}

export function useDiscoverMoviesQuery(
  input: DiscoverQueryInput,
  { enabled = true }: QueryUsageInput = {},
) {
  return useQuery({
    ...discoverMoviesQueryOptions(input),
    enabled,
  })
}

export function useMovieDetailsQuery(input: MovieDetailsQueryInput) {
  return useQuery(movieDetailsQueryOptions(input))
}

export function useMovieReleaseDatesQuery(input: MovieReleaseDatesQueryInput) {
  return useQuery(movieReleaseDatesQueryOptions(input))
}

export function useSearchMoviesQuery(
  input: SearchMoviesQueryInput,
  { enabled = true }: QueryUsageInput = {},
) {
  return useQuery({
    ...searchMoviesQueryOptions(input),
    enabled,
  })
}

export function useMovieGenresQuery(
  input: ListQueryInput,
  { enabled = true }: QueryUsageInput = {},
) {
  return useQuery({
    ...movieGenresQueryOptions(input),
    enabled,
  })
}