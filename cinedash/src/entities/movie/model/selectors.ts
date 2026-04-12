import type { Movie } from './types'

export function selectMovieById(
  filmes: Movie[],
  movieId: number,
): Movie | undefined {
  return filmes.find((filmeAtual) => filmeAtual.id === movieId)
}

export function selectFavoriteMovies(filmes: Movie[]): Movie[] {
  return filmes.filter((filmeAtual) => filmeAtual.isFavorite)
}

export function selectWatchlistMovies(filmes: Movie[]): Movie[] {
  return filmes.filter((filmeAtual) => filmeAtual.inWatchlist)
}

export function mergeUniqueMovies(listasFilmes: Movie[][]): Movie[] {
  const filmesPorId = new Map<number, Movie>()

  listasFilmes.flat().forEach((filmeAtual) => {
    filmesPorId.set(filmeAtual.id, filmeAtual)
  })

  return Array.from(filmesPorId.values())
}
