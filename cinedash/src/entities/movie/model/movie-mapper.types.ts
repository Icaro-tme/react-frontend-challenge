import type { EstadoUsuarioFilmesSnapshot } from '../../user/model/user-movie-state.types'
import type { MovieGenresById } from './types'

export interface MovieMapperContext {
  estadoUsuario: EstadoUsuarioFilmesSnapshot
  genresById?: MovieGenresById
}
