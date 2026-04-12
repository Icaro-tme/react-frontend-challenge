export interface ConfiguracaoTmdb {
  apiBaseUrl: string
  tokenAcessoLeitura: string
  apiKey: string
}

type QueryValor = string | number | boolean | undefined | null

export type QueryParametros = Record<string, QueryValor>

export interface TmdbClientDependencias {
  fetchFn?: typeof fetch
  configuracao?: ConfiguracaoTmdb
}

export type JanelaTendencia = 'day' | 'week'

export type OrdenacaoDescoberta =
  | 'popularity.desc'
  | 'popularity.asc'
  | 'primary_release_date.desc'
  | 'primary_release_date.asc'
  | 'vote_average.desc'
  | 'vote_average.asc'

export type MovieDetailsAppendItem = 'credits' | 'videos'

export interface TmdbGenreDto {
  id: number
  name: string
}

export interface TmdbMovieCastDto {
  id: number
  name: string
  character: string
  profile_path: string | null
}

export interface TmdbMovieCrewDto {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export interface TmdbMovieCreditsResponse {
  id: number
  cast: TmdbMovieCastDto[]
  crew: TmdbMovieCrewDto[]
}

export interface TmdbMovieVideoDto {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
}

export interface TmdbMovieVideosResponse {
  id: number
  results: TmdbMovieVideoDto[]
}

export interface TmdbMovieDto {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  backdrop_path: string | null
  release_date?: string
  overview: string
  vote_average?: number
  vote_count?: number
  popularity?: number
  budget?: number
  revenue?: number
  runtime?: number
  tagline?: string
  adult?: boolean
  genre_ids?: number[]
  genres?: TmdbGenreDto[]
  credits?: TmdbMovieCreditsResponse
  videos?: TmdbMovieVideosResponse
}

export interface TmdbMovieListResponse {
  page: number
  results: TmdbMovieDto[]
  total_pages: number
  total_results: number
}

export interface TmdbGenreListResponse {
  genres: TmdbGenreDto[]
}

export interface TmdbMovieDetailsResponse extends TmdbMovieDto {
  genres: TmdbGenreDto[]
}

export interface TmdbMovieReleaseDateDto {
  certification: string
  release_date: string
}

export interface TmdbMovieReleaseDateByCountryDto {
  iso_3166_1: string
  release_dates: TmdbMovieReleaseDateDto[]
}

export interface TmdbMovieReleaseDatesResponse {
  id: number
  results: TmdbMovieReleaseDateByCountryDto[]
}

export interface BuscarFilmesTendenciaParams {
  timeWindow?: JanelaTendencia
  page?: number
  language?: string
}

export interface BuscarFilmesPopularesParams {
  page?: number
  language?: string
  region?: string
}

export interface BuscarFilmesTopRatedParams {
  page?: number
  language?: string
  region?: string
}

export interface BuscarFilmesUpcomingParams {
  page?: number
  language?: string
  region?: string
}

export interface BuscarFilmesDescobertaParams {
  page?: number
  language?: string
  region?: string
  generos?: string
  dataLancamentoInicial?: string
  dataLancamentoFinal?: string
  anoLancamento?: number
  notaMinima?: number
  ordenacao?: OrdenacaoDescoberta
}

export interface BuscarFilmesBuscaParams {
  query: string
  page?: number
  anoLancamento?: number
  anoLancamentoPrimario?: number
  region?: string
  language?: string
  includeAdult?: boolean
}

export interface BuscarGenerosFilmeParams {
  language?: string
}

export interface BuscarDetalhesFilmeParams {
  movieId: number
  language?: string
  appendToResponse?: MovieDetailsAppendItem[]
}

export interface BuscarClassificacoesFilmeParams {
  movieId: number
  language?: string
}
