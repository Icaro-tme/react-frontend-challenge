import type { TmdbMovieDto, TmdbMovieListResponse } from '../../../shared/api/tmdb'
import type { EstadoUsuarioFilmesSnapshot } from '../../user/model/user-movie-state.types'
import type { Movie } from './types'
import type { MovieMapperContext } from './movie-mapper.types'

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'
const POSTER_SIZE = 'w500'
const BACKDROP_SIZE = 'w780'

function buildImageUrl(caminhoImagem: string | null, tamanho: string): string {
  if (!caminhoImagem) {
    return ''
  }

  return `${TMDB_IMAGE_BASE_URL}/${tamanho}${caminhoImagem}`
}

function resolveGenres(
  filmeApi: TmdbMovieDto,
  genresById: Record<number, string> | undefined,
): string[] {
  if (filmeApi.genres && filmeApi.genres.length > 0) {
    return filmeApi.genres.map((genero) => genero.name)
  }

  if (!filmeApi.genre_ids || filmeApi.genre_ids.length === 0) {
    return []
  }

  return filmeApi.genre_ids
    .map((generoId) => genresById?.[generoId])
    .filter((generoAtual): generoAtual is string => Boolean(generoAtual))
}

function resolveGenreIds(filmeApi: TmdbMovieDto): number[] {
  if (filmeApi.genre_ids && filmeApi.genre_ids.length > 0) {
    return [...filmeApi.genre_ids]
  }

  if (filmeApi.genres && filmeApi.genres.length > 0) {
    return filmeApi.genres.map((generoAtual) => generoAtual.id)
  }

  return []
}

function resolveSetlists(
  movieId: number,
  estadoUsuario: EstadoUsuarioFilmesSnapshot,
): string[] {
  return estadoUsuario.setlists
    .filter((setlistAtual) => setlistAtual.movieIds.includes(movieId))
    .map((setlistAtual) => setlistAtual.name)
}

export function createMovieFromTmdb(
  filmeApi: TmdbMovieDto,
  contexto: MovieMapperContext,
): Movie {
  const { estadoUsuario, genresById } = contexto
  const titulo = filmeApi.title ?? filmeApi.name ?? `Filme #${filmeApi.id}`

  return {
    id: filmeApi.id,
    title: titulo,
    posterUrl: buildImageUrl(filmeApi.poster_path, POSTER_SIZE),
    backdropUrl: buildImageUrl(filmeApi.backdrop_path, BACKDROP_SIZE),
    releaseDate: filmeApi.release_date ?? '',
    overview: filmeApi.overview ?? '',
    voteAverage: filmeApi.vote_average ?? 0,
    voteCount: filmeApi.vote_count ?? 0,
    popularity: filmeApi.popularity ?? 0,
    genreIds: resolveGenreIds(filmeApi),
    genres: resolveGenres(filmeApi, genresById),
    isFavorite: estadoUsuario.favoriteMovieIds.includes(filmeApi.id),
    setlists: resolveSetlists(filmeApi.id, estadoUsuario),
    inWatchlist: estadoUsuario.watchlistMovieIds.includes(filmeApi.id),
    watched: estadoUsuario.watchedMovieIds.includes(filmeApi.id),
  }
}

export function mapTmdbMovieList(
  respostaApi: TmdbMovieListResponse,
  contexto: MovieMapperContext,
): Movie[] {
  return respostaApi.results.map((filmeApi) => createMovieFromTmdb(filmeApi, contexto))
}

export function mapTmdbMovieDetails(
  filmeApi: TmdbMovieDto,
  contexto: MovieMapperContext,
): Movie {
  return createMovieFromTmdb(filmeApi, contexto)
}
