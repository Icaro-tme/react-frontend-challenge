import type { TmdbGenreDto } from '../../../shared/api/tmdb'
import type { MovieGenresById } from './types'

export function buildMovieGenresById(generos: TmdbGenreDto[] | undefined): MovieGenresById {
  if (!generos || generos.length === 0) {
    return {}
  }

  return generos.reduce<MovieGenresById>((mapaAtual, generoAtual) => {
    mapaAtual[generoAtual.id] = generoAtual.name
    return mapaAtual
  }, {})
}